import { ProductStatus } from "@prisma/client";
import * as z from "zod";

const titleSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined
        ? "Title is required"
        : "Title must be a string",
  })
  .trim()
  .min(1, "Title can't be empty")
  .max(200, "Title can't be more than 200 characters long");

const descriptionSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined
        ? "Description is required"
        : "Description must be a string",
  })
  .trim()
  .min(1, "Description can't be empty");

const statusSchema = z
  .enum([ProductStatus.DRAFT, ProductStatus.ACTIVE])
  .default(ProductStatus.DRAFT);

const attributeSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    value: z.string().trim().min(1).max(255),
  })
  .strict();

const variantSchema = z
  .object({
    price: z.coerce.number().positive("Price must be greater than 0"),
    compareAtPrice: z.coerce.number().positive().optional(),
    stock: z.coerce.number().int().min(0).optional(),
    weightGrams: z.coerce.number().int().positive().optional(),
    attributes: z.array(attributeSchema).optional(),
  })
  .strict()
  .refine((data) => !data.compareAtPrice || data.compareAtPrice > data.price, {
    message: "compareAtPrice must be greater than price",
    path: ["compareAtPrice"],
  });

const createProduct = z
  .object({
    title: titleSchema,
    description: descriptionSchema,
    discountPercentage: z.coerce.number().int().min(0).max(100).optional(),
    status: statusSchema,
    brandId: z.uuid().optional(),
    categoryIds: z.array(z.uuid()).optional(),
    variants: z.array(variantSchema).optional(),
  })
  .strict();

const updateProduct = z
  .object({
    title: titleSchema,
    description: descriptionSchema,
    discountPercentage: z.coerce.number().int().min(0).max(100),
    status: z.enum(ProductStatus),
    brandId: z.uuid().nullable(),
    categoryIds: z.array(z.uuid()),
  })
  .partial()
  .strict();

const updateVariant = z
  .object({
    price: z.coerce
      .number()
      .positive("Price must be greater than 0")
      .optional(),
    compareAtPrice: z.coerce.number().positive().optional(),
    stock: z.coerce.number().int().min(0).optional(),
    weightGrams: z.coerce.number().int().positive().optional(),
    version: z.coerce.number().int().min(0, "version is required"),
  })
  .strict();

const addImages = z
  .object({
    variantId: z.uuid().optional(),
  })
  .strict();

export const productValidation = {
  createProduct,
  updateProduct,
  addVariant: variantSchema,
  updateVariant,
  addImages,
};
