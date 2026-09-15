import * as z from "zod";

const nameSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined ? "Name is required" : "Name must be a string",
  })
  .trim()
  .min(1, "Name can't be empty")
  .max(255, "Name can't be more than 255 characters long");

const parentIdSchema = z.uuid("Invalid parent category ID");

const descriptionSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined
        ? "Description is required"
        : "Description must be a string",
  })
  .trim()
  .max(1000, "Description can't be more than 1000 characters long");

const createCategory = z
  .object({
    name: nameSchema,
    parentId: parentIdSchema.optional(),
    description: descriptionSchema.optional(),
  })
  .strict();

const updateCategory = z
  .object({
    name: nameSchema,
    parentId: parentIdSchema.nullable(),
    description: descriptionSchema,
  })
  .partial()
  .strict();

export const categoryValidation = {
  createCategory,
  updateCategory,
};
