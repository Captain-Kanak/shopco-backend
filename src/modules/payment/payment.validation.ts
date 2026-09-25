import * as z from "zod";

const createPaymentIntent = z
  .object({
    orderId: z.uuid("Invalid order ID"),
  })
  .strict();

export const paymentValidation = {
  createPaymentIntent,
};
