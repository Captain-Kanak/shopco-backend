import AppError from "../../errors/app-error.js";
import status from "http-status";
import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { CreatePaymentIntent } from "./payment.interface.js";
import { stripe } from "../../lib/stripe.js";
import Stripe from "stripe";

const constructWebhookEvent = (
  rawBody: Buffer,
  signature: string,
): Stripe.Event => {
  try {
    return stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    throw new AppError("Invalid webhook signature", status.BAD_REQUEST);
  }
};

const handlePaymentIntentSucceeded = async (
  paymentIntent: Stripe.PaymentIntent,
): Promise<void> => {
  const { orderId } = paymentIntent.metadata;

  if (!orderId) {
    console.error(
      "Webhook received with no orderId in metadata:",
      paymentIntent.id,
    );
    return;
  }

  const payment = await prisma.payment.findUnique({
    where: { transactionId: paymentIntent.id },
  });

  if (!payment) {
    console.error("Webhook received for unknown payment:", paymentIntent.id);
    return;
  }

  if (payment.status === PaymentStatus.PAID) {
    return;
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.PAID },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.PAID,
        paidAt: new Date(),
        orderStatus: OrderStatus.PROCESSING,
      },
    }),
  ]);
};

const handlePaymentIntentFailed = async (
  paymentIntent: Stripe.PaymentIntent,
): Promise<void> => {
  const payment = await prisma.payment.findUnique({
    where: { transactionId: paymentIntent.id },
  });

  if (!payment) {
    console.error("Webhook received for unknown payment:", paymentIntent.id);
    return;
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: PaymentStatus.FAILED },
  });
};

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
      method: PaymentMethod.STRIPE,
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

const handleStripeWebhookEvent = async (
  rawBody: Buffer,
  signature: string,
): Promise<void> => {
  const event = constructWebhookEvent(rawBody, signature);

  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(event.data.object);
      break;

    case "payment_intent.payment_failed":
      await handlePaymentIntentFailed(event.data.object);
      break;

    default:
      break;
  }
};

export const paymentService = {
  createPaymentIntent,
  handleStripeWebhookEvent,
};
