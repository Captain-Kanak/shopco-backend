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

const addBrand = async (payload: CreateBrand): Promise<Brand> => {
  const existing = await prisma.brand.findFirst({
    where: { slug: payload.slug },
  });

  if (existing) {
    throw new AppError(
      "A brand with this slug already exists",
      status.CONFLICT,
    );
  }

  return prisma.brand.create({ data: payload });
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

  if (payload.slug && payload.slug !== brand.slug) {
    const existing = await prisma.brand.findFirst({
      where: { slug: payload.slug },
    });

    if (existing) {
      throw new AppError(
        "A brand with this slug already exists",
        status.CONFLICT,
      );
    }
  }

  if (payload.logo && brand.logo) {
    await deleteFromCloudinaryByUrl(brand.logo);
  }

  return prisma.brand.update({ where: { id: brandId }, data: payload });
};

const deleteBrandById = async (brandId: string): Promise<Brand> => {
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    include: { _count: { select: { products: true } } },
  });

  if (!brand) {
    throw new AppError("Brand not found", status.NOT_FOUND);
  }

  // Brand is hard-deleted (see schema decision). Product.brandId is
  // String? with onDelete: SetNull, so any products referencing this
  // brand will automatically have brandId set to null — they are not
  // deleted, just unbranded. No manual cleanup needed here; the DB
  // relation handles it on the real DELETE below.
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
