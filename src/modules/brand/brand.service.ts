import status from "http-status";
import AppError from "../../errors/app-error.js";
import { prisma } from "../../lib/prisma.js";
import { Brand, Prisma } from "@prisma/client";
import { CreateBrand, UpdateBrand } from "./brand.interface.js";
import { deleteFromCloudinaryByUrl } from "../../config/cloudinary.js";
import { QueryBuilder } from "../../query-builder/query-builder.js";
import {
  QueryBuilderParams,
  QueryBuilderResult,
} from "../../query-builder/query-builder.interface.js";
import { brandConstant } from "./brand.constant.js";
import { generateUniqueSlug } from "../../utils/generate-slug.js";

const addBrand = async (payload: CreateBrand): Promise<Brand> => {
  const existing = await prisma.brand.findFirst({
    where: { name: { equals: payload.name, mode: "insensitive" } },
  });

  if (existing) {
    throw new AppError(
      "A brand with this name already exists",
      status.CONFLICT,
    );
  }

  const slug = generateUniqueSlug(payload.name);

  const newBrand = await prisma.brand.create({
    data: {
      ...payload,
      slug,
    },
  });

  return newBrand;
};

const getBrands = async (
  query: QueryBuilderParams,
): Promise<QueryBuilderResult<Brand>> => {
  const queryBuilder = new QueryBuilder<
    Brand,
    Prisma.BrandWhereInput,
    Prisma.BrandInclude
  >(prisma.brand, query, {
    searchableFields: brandConstant.searchableFields,
    filterableFields: brandConstant.filterableFields,
    selectableFields: brandConstant.selectableFields,
    includableFields: brandConstant.includableFields,
    sortableFields: brandConstant.sortableFields,
    softDelete: false,
  });

  return queryBuilder
    .pagination()
    .sort()
    .where({})
    .search()
    .filter()
    .select()
    .include({})
    .execute();
};

const getBrandById = async (brandId: string): Promise<Brand> => {
  const brand = await prisma.brand.findUnique({ where: { id: brandId } });

  if (!brand) {
    throw new AppError("Brand not found", status.NOT_FOUND);
  }

  return brand;
};

const updateBrandById = async (
  brandId: string,
  payload: UpdateBrand,
): Promise<Brand> => {
  const brand = await prisma.brand.findUnique({ where: { id: brandId } });

  if (!brand) {
    throw new AppError("Brand not found", status.NOT_FOUND);
  }

  if (payload.name && payload.name.toLowerCase() !== brand.name.toLowerCase()) {
    const existingByName = await prisma.brand.findFirst({
      where: {
        name: { equals: payload.name, mode: "insensitive" },
        id: { not: brandId },
      },
    });

    if (existingByName) {
      throw new AppError(
        "A brand with this name already exists",
        status.CONFLICT,
      );
    }
  }

  if (payload.logo && brand.logo) {
    await deleteFromCloudinaryByUrl(brand.logo);
  }

  const updatedBrand = await prisma.brand.update({
    where: { id: brandId },
    data: payload,
  });

  return updatedBrand;
};

const deleteBrandById = async (brandId: string): Promise<Brand> => {
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    include: { _count: { select: { products: true } } },
  });

  if (!brand) {
    throw new AppError("Brand not found", status.NOT_FOUND);
  }

  if (brand._count.products > 0) {
    throw new AppError(
      "Cannot delete a brand that still has products. Reassign or remove its products first.",
      status.CONFLICT,
    );
  }

  if (brand.logo) {
    await deleteFromCloudinaryByUrl(brand.logo);
  }

  return prisma.brand.delete({ where: { id: brandId } });
};

export const brandService = {
  addBrand,
  getBrands,
  getBrandById,
  updateBrandById,
  deleteBrandById,
};
