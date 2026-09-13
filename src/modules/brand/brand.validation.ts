import * as z from "zod";

const nameSchema = z
  .string({ error: "Name must be a string" })
  .trim()
  .min(1, "Name can't be empty")
  .max(255, "Name can't be more than 255 characters long");

const descriptionSchema = z
  .string({ error: "Description must be a string" })
  .trim()
  .max(1000, "Description can't be more than 1000 characters long");

const createBrand = z
  .object({
    name: nameSchema,
    description: descriptionSchema.optional(),
  })
  .strict();

const updateBrand = z
  .object({
    name: nameSchema,
    description: descriptionSchema,
  })
  .partial()
  .strict();

export const brandValidation = {
  createBrand,
  updateBrand,
};
