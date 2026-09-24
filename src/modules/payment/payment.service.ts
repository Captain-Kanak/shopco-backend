import { Request } from "express";
import AppError from "../../errors/app-error.js";
import status from "http-status";
import { env } from "../../config/env.js";
import Stripe from "stripe";
import { prisma } from "../../lib/prisma.js";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { CreatePaymentIntent } from "./payment.interface.js";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (
  userId: string,
  payload: CreatePaymentIntent,
): Promise<string> => {
  const order = await prisma.order.findFirst({
    where: { id: payload.orderId, userId, deletedAt: null },
    include: { orderItems: true },
  });

  if (!order) {
    throw new AppError("Order not found", status.NOT_FOUND);
  }

  const amountInCents = Number(order.totalAmount) * 100;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: {
      userId,
      orderId: order.id,
    },
  });

  await prisma.payment.create({
    data: {
      userId,
      orderId: order.id,
      amount: order.totalAmount,
      transactionId: paymentIntent.id,
      method: PaymentMethod.STRIPE,
      status: PaymentStatus.UNPAID,
    },
  });

  const secret = paymentIntent.client_secret as string;

  return secret;
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
