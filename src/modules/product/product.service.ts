import status from "http-status";
import AppError from "../../errors/app-error.js";
import { prisma } from "../../lib/prisma.js";
import { Prisma, Product, ProductStatus, ProductVariant } from "@prisma/client";
import {
  AddProductVariant,
  CreateProduct,
  UpdateProduct,
  UpdateProductVariant,
} from "./product.interface.js";
import { generateUniqueSlug } from "../../utils/generate-slug.js";
import {
  QueryBuilderParams,
  QueryBuilderResult,
} from "../../query-builder/query-builder.interface.js";
import { QueryBuilder } from "../../query-builder/query-builder.js";
import { productConstant } from "./product.constant.js";
import { generateSku } from "../../utils/generate-sku.js";

const addProduct = async (payload: CreateProduct): Promise<Product> => {
  const {
    brandId,
    categoryIds,
    variants,
    status: requestedStatus,
    ...productFields
  } = payload;

  if (brandId) {
    const brand = await prisma.brand.findUnique({ where: { id: brandId } });

    if (!brand) {
      throw new AppError("Brand not found", status.NOT_FOUND);
    }
  }

  if (categoryIds?.length) {
    const foundCategories = await prisma.category.findMany({
      where: { id: { in: categoryIds }, deletedAt: null },
      select: { id: true },
    });

    if (foundCategories.length !== categoryIds.length) {
      throw new AppError("One or more categories not found", status.NOT_FOUND);
    }
  }

  if (variants?.length) {
    const signatures = variants.map((v) =>
      (v.attributes ?? [])
        .map((a) => `${a.name.toLowerCase()}:${a.value.toLowerCase()}`)
        .sort()
        .join("|"),
    );

    if (new Set(signatures).size !== signatures.length) {
      throw new AppError(
        "Two or more variants have identical attributes",
        status.BAD_REQUEST,
      );
    }
  }

  const slug = generateUniqueSlug(payload.title);

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        ...productFields,
        slug,
        status: requestedStatus ?? ProductStatus.DRAFT,
        ...(brandId && { brandId }),
        ...(categoryIds?.length && {
          productCategories: {
            create: categoryIds.map((categoryId) => ({ categoryId })),
          },
        }),
        ...(variants?.length && {
          variants: {
            create: variants.map((variant) => ({
              sku: generateSku(payload.title, variant.attributes),
              price: variant.price,
              compareAtPrice: variant.compareAtPrice,
              stock: variant.stock ?? 0,
              weightGrams: variant.weightGrams,
              ...(variant.attributes?.length && {
                attributes: {
                  create: variant.attributes,
                },
              }),
            })),
          },
        }),
      },
      include: {
        brand: true,
        variants: { include: { attributes: true } },
        productCategories: { include: { category: true } },
      },
    });

    return product;
  });
};

const getProducts = async (
  query: QueryBuilderParams,
  isAdmin: boolean,
): Promise<QueryBuilderResult<Product>> => {
  const queryBuilder = new QueryBuilder<
    Product,
    Prisma.ProductWhereInput,
    Prisma.ProductInclude
  >(prisma.product, query, {
    searchableFields: productConstant.searchableFields,
    filterableFields: productConstant.filterableFields,
    selectableFields: productConstant.selectableFields,
    includableFields: productConstant.includableFields,
    sortableFields: productConstant.sortableFields,
    numericFields: productConstant.numericFields,
  });

  return queryBuilder
    .pagination()
    .sort()
    .where(isAdmin ? {} : { status: ProductStatus.ACTIVE })
    .search()
    .filter()
    .select()
    .include({})
    .execute();
};

const getProductById = async (
  productId: string,
  isAdmin: boolean,
): Promise<Product> => {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      deletedAt: null,
      ...(!isAdmin && { status: "ACTIVE" }),
    },
    include: {
      brand: true,
      productCategories: { include: { category: true } },
      variants: {
        where: { deletedAt: null },
        include: { attributes: true, images: true },
      },
      images: { where: { variantId: null } },
    },
  });

  if (!product) {
    throw new AppError("Product not found", status.NOT_FOUND);
  }

  return product;
};

const updateProductById = async (
  productId: string,
  payload: UpdateProduct,
): Promise<Product> => {
  const { brandId, categoryIds, ...productFields } = payload;

  const product = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
  });

  if (!product) {
    throw new AppError("Product not found", status.NOT_FOUND);
  }

  if (brandId) {
    const brand = await prisma.brand.findUnique({ where: { id: brandId } });

    if (!brand) {
      throw new AppError("Brand not found", status.NOT_FOUND);
    }
  }

  if (categoryIds?.length) {
    const foundCategories = await prisma.category.findMany({
      where: { id: { in: categoryIds }, deletedAt: null },
      select: { id: true },
    });

    if (foundCategories.length !== categoryIds.length) {
      throw new AppError("One or more categories not found", status.NOT_FOUND);
    }
  }

  return prisma.$transaction(async (tx) => {
    if (categoryIds !== undefined) {
      await tx.productCategory.deleteMany({ where: { productId } });

      if (categoryIds.length) {
        await tx.productCategory.createMany({
          data: categoryIds.map((categoryId) => ({ productId, categoryId })),
        });
      }
    }

    return tx.product.update({
      where: { id: productId },
      data: {
        ...productFields,
        ...(brandId !== undefined && { brandId }),
      },
      include: {
        brand: true,
        productCategories: { include: { category: true } },
      },
    });
  });
};

const deleteProductById = async (productId: string): Promise<Product> => {
  const product = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
  });

  if (!product) {
    throw new AppError("Product not found", status.NOT_FOUND);
  }

  const deletedAt = new Date();

  return prisma.$transaction(async (tx) => {
    await tx.productVariant.updateMany({
      where: { productId, deletedAt: null },
      data: { deletedAt },
    });

    return tx.product.update({
      where: { id: productId },
      data: { deletedAt },
    });
  });
};

const addVariantToProduct = async (
  productId: string,
  payload: AddProductVariant,
): Promise<ProductVariant> => {
  const product = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
  });

  if (!product) {
    throw new AppError("Product not found", status.NOT_FOUND);
  }

  if (payload.attributes?.length) {
    const existingVariants = await prisma.productVariant.findMany({
      where: { productId, deletedAt: null },
      include: { attributes: true },
    });

    const newSignature = payload.attributes
      .map((a) => `${a.name.toLowerCase()}:${a.value.toLowerCase()}`)
      .sort()
      .join("|");

    const collides = existingVariants.some((variant) => {
      const existingSignature = variant.attributes
        .map((a) => `${a.name.toLowerCase()}:${a.value.toLowerCase()}`)
        .sort()
        .join("|");
      return existingSignature === newSignature;
    });

    if (collides) {
      throw new AppError(
        "A variant with these exact attributes already exists on this product",
        status.CONFLICT,
      );
    }
  }

  const sku = generateSku(product.title, payload.attributes);

  return prisma.productVariant.create({
    data: {
      productId,
      sku,
      price: payload.price,
      compareAtPrice: payload.compareAtPrice,
      stock: payload.stock ?? 0,
      weightGrams: payload.weightGrams,
      ...(payload.attributes?.length && {
        attributes: { create: payload.attributes },
      }),
    },
    include: { attributes: true },
  });
};

const updateVariantById = async (
  productId: string,
  variantId: string,
  payload: UpdateProductVariant,
): Promise<ProductVariant> => {
  const { version, ...updateFields } = payload;

  const variant = await prisma.productVariant.findFirst({
    where: { id: variantId, productId, deletedAt: null },
  });

  if (!variant) {
    throw new AppError("Variant not found", status.NOT_FOUND);
  }

  if (updateFields.compareAtPrice !== undefined) {
    const effectivePrice = updateFields.price ?? Number(variant.price);
    if (updateFields.compareAtPrice <= effectivePrice) {
      throw new AppError(
        "compareAtPrice must be greater than price",
        status.BAD_REQUEST,
      );
    }
  }

  const result = await prisma.productVariant.updateMany({
    where: { id: variantId, productId, version },
    data: {
      ...updateFields,
      version: { increment: 1 },
    },
  });

  if (result.count === 0) {
    throw new AppError(
      "This variant was modified by someone else. Please refresh and try again.",
      status.CONFLICT,
    );
  }

  return prisma.productVariant.findUniqueOrThrow({
    where: { id: variantId },
    include: { attributes: true },
  });
};

export const productService = {
  addProduct,
  getProducts,
  getProductById,
  updateProductById,
  deleteProductById,
  addVariantToProduct,
  updateVariantById,
};
