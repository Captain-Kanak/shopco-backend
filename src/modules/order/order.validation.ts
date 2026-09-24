import { OrderStatus, PaymentStatus } from "@prisma/client";
import * as z from "zod";

const createOrder = z
  .object({
    recipientName: z.string().trim().min(1).max(255),
    shippingAddressLine: z.string().trim().min(1),
    shippingCity: z.string().trim().min(1).max(100),
    shippingDistrict: z.string().trim().min(1).max(100),
    shippingPostalCode: z.string().trim().max(20).optional(),
    phone: z.string().regex(/^\+?[0-9]{7,15}$/, "Invalid phone number"),
  })
  .strict();

const cancelOrder = z
  .object({
    cancelReason: z.string().trim().max(500).optional(),
  })
  .partial()
  .strict();

const updateOrderStatus = z
  .object({
    orderStatus: z.enum(OrderStatus),
    paymentStatus: z.enum(PaymentStatus),
  })
  .partial()
  .strict();

export const orderValidation = {
  createOrder,
  cancelOrder,
  updateOrderStatus,
};
