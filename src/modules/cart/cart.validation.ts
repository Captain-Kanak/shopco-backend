import * as z from "zod";

const addToCart = z
  .object({
    variantId: z.uuid("Invalid variant ID"),
    quantity: z.coerce.number().int().positive().default(1),
  })
  .strict();

const updateCartQuantity = z
  .object({
    quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
  })
  .strict();

export const cartValidation = {
  addToCart,
  updateCartQuantity,
};
