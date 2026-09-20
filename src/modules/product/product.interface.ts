import { ProductStatus } from "@prisma/client";

export interface CreateProductVariantAttribute {
  name: string;
  value: string;
}

export interface CreateProductVariant {
  price: number;
  compareAtPrice?: number;
  stock?: number;
  weightGrams?: number;
  attributes?: CreateProductVariantAttribute[];
}

export interface CreateProduct {
  title: string;
  description: string;
  discountPercentage?: number;
  status?: Extract<ProductStatus, "DRAFT" | "ACTIVE">;
  brandId?: string;
  categoryIds?: string[];
  variants?: CreateProductVariant[];
}

export interface UpdateProduct {
  title?: string;
  description?: string;
  discountPercentage?: number;
  status?: ProductStatus;
  brandId?: string | null;
  categoryIds?: string[];
}

export interface AddProductVariant {
  price: number;
  compareAtPrice?: number;
  stock?: number;
  weightGrams?: number;
  attributes?: CreateProductVariantAttribute[];
}

export interface UpdateProductVariant {
  price?: number;
  compareAtPrice?: number;
  stock?: number;
  weightGrams?: number;
  version: number;
}

export interface AddProductImages {
  variantId?: string;
}
