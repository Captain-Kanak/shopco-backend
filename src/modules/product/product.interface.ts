import { ProductStatus } from "@prisma/client";

export interface CreateProduct {
  title: string;
  description: string;
  discountPercentage?: number;
  status?: Extract<ProductStatus, "DRAFT" | "ACTIVE">;
  brandId?: string;
  categoryIds?: string[];
  variants?: CreateProductVariant[];
}

export interface CreateProductVariant {
  price: number;
  compareAtPrice?: number;
  stock?: number;
  weightGrams?: number;
  attributes?: CreateProductVariantAttribute[];
}

export interface CreateProductVariantAttribute {
  name: string;
  value: string;
}
