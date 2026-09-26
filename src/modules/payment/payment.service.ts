import { Request } from "express";
import AppError from "../../errors/app-error.js";
import status from "http-status";
import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { CreatePaymentIntent } from "./payment.interface.js";
import { stripe } from "../../lib/stripe.js";
import Stripe from "stripe";

const createPaymentIntent = async (
  userId: string,
  payload: CreatePaymentIntent,
): Promise<{ clientSecret: string; paymentId: string }> => {
  const order = await prisma.order.findFirst({
    where: { id: payload.orderId, userId, deletedAt: null },
  });

  if (!order) {
    throw new AppError("Order not found", status.NOT_FOUND);
  }

  if (order.paymentStatus === PaymentStatus.PAID) {
    throw new AppError("This order has already been paid", status.CONFLICT);
  }

  if (order.orderStatus === OrderStatus.CANCELLED) {
    throw new AppError("Cannot pay for a cancelled order", status.CONFLICT);
  }

  const existingPendingPayment = await prisma.payment.findFirst({
    where: {
      orderId: order.id,
      status: PaymentStatus.UNPAID,
      paymentMethod: PaymentMethod.STRIPE,
    },
    orderBy: { createdAt: "desc" },
  });

  if (existingPendingPayment) {
    const existingIntent = await stripe.paymentIntents.retrieve(
      existingPendingPayment.transactionId!,
    );

    const reusableStatuses = [
      "requires_payment_method",
      "requires_confirmation",
      "requires_action",
    ];

    if (
      reusableStatuses.includes(existingIntent.status) &&
      existingIntent.client_secret
    ) {
      return {
        clientSecret: existingIntent.client_secret,
        paymentId: existingPendingPayment.id,
      };
    }
  }

  const amountInSmallestUnit = Math.round(Number(order.totalAmount) * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInSmallestUnit,
    currency: "bdt",
    automatic_payment_methods: { enabled: true },
    metadata: {
      userId,
      orderId: order.id,
      orderNumber: order.orderNumber,
    },
  });

  if (!paymentIntent.client_secret) {
    throw new AppError(
      "Failed to initialize payment",
      status.INTERNAL_SERVER_ERROR,
    );
  }

  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      userId,
      amount: order.totalAmount,
      transactionId: paymentIntent.id,
      method: PaymentMethod.STRIPE,
      status: PaymentStatus.UNPAID,
    },
  });

  return { clientSecret: paymentIntent.client_secret, paymentId: payment.id };
};

const handleStripeWebhook = async (req: Request): Promise<void> => {
  const signature = req.headers["stripe-signature"];

  if (!signature) {
    throw new AppError("Missing Stripe signature", status.BAD_REQUEST);
  }

  const event = stripe.webhooks.constructEvent(
    req.body,
    signature,
    env.STRIPE_WEBHOOK_SECRET,
  );

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      // const payment = await prisma.payment.findFirst({
      //   where: { transactionId: paymentIntent.id },
      // });

      const payment = await prisma.payment.findUnique({
        where: { transactionId: paymentIntent.id },
      });

      if (!payment) {
        break;
      }

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { transactionId: paymentIntent.id },
          data: {
            status: PaymentStatus.PAID,
          },
        });

        await tx.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: PaymentStatus.PAID,
            paidAt: new Date(),
          },
        });
      });

      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      const payment = await prisma.payment.findUnique({
        where: { transactionId: paymentIntent.id },
      });

      if (!payment) {
        break;
      }

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { transactionId: paymentIntent.id },
          data: {
            status: PaymentStatus.FAILED,
          },
        });

        await tx.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: PaymentStatus.FAILED,
          },
        });
      });

      break;
    }

    default:
      break;
  }
};

export const paymentService = {
  createPaymentIntent,
  handleStripeWebhook,
};
