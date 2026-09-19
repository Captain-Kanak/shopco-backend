import status from "http-status";
import AppError from "../../errors/app-error.js";
import { prisma } from "../../lib/prisma.js";
import { Prisma, Product, ProductStatus } from "@prisma/client";
import { CreateProduct, UpdateProduct } from "./product.interface.js";
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

  return prisma.$transaction(async (tx) => {
    await tx.productVariant.updateMany({
      where: { productId, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    return tx.product.update({
      where: { id: productId },
      data: { deletedAt: new Date() },
    });
  });
};

export const productService = {
  addProduct,
  getProducts,
  getProductById,
  updateProductById,
  deleteProductById,
};
