import * as z from "zod";

const nameSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined ? "Name is required" : "Name must be a string",
  })
  .trim()
  .min(1, "Name is required")
  .max(255, "Name can't be more than 255 characters long");

const descriptionSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined
        ? "Description is required"
        : "Description must be a string",
  })
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
