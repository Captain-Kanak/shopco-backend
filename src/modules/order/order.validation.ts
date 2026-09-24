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

export const orderValidation = {
  createOrder,
};
