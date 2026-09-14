import status from "http-status";
import AppError from "../../errors/app-error.js";
import { prisma } from "../../lib/prisma.js";
import { Category, Prisma } from "@prisma/client";
import { CreateCategory, UpdateCategory } from "./category.interface.js";
import { QueryBuilder } from "../../query-builder/query-builder.js";
import {
  QueryBuilderParams,
  QueryBuilderResult,
} from "../../query-builder/query-builder.interface.js";
import { categoryConstant } from "./category.constant.js";
import { generateUniqueSlug } from "../../utils/generate-slug.js";

const assertParentExists = async (parentId: string): Promise<void> => {
  const parent = await prisma.category.findFirst({
    where: { id: parentId, deletedAt: null },
  });

  if (!parent) {
    throw new AppError("Parent category not found", status.NOT_FOUND);
  }
};

const assertNoSiblingNameConflict = async (
  name: string,
  parentId: string | null,
  excludeId?: string,
): Promise<void> => {
  const existing = await prisma.category.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      parentId,
      deletedAt: null,
      ...(excludeId && { id: { not: excludeId } }),
    },
  });

  if (existing) {
    throw new AppError(
      "A category with this name already exists under the same parent",
      status.CONFLICT,
    );
  }
};

// Prevents assigning a category as its own descendant's child — e.g.
// "Phones" cannot become the parent of "Electronics" if "Phones" is
// currently a child of "Electronics", since that would create a cycle.
const assertNoCircularReference = async (
  categoryId: string,
  newParentId: string,
): Promise<void> => {
  if (categoryId === newParentId) {
    throw new AppError(
      "A category cannot be its own parent",
      status.BAD_REQUEST,
    );
  }

  let currentId: string | null = newParentId;
  const visited = new Set<string>();

  while (currentId) {
    if (currentId === categoryId) {
      throw new AppError(
        "This change would create a circular category hierarchy",
        status.BAD_REQUEST,
      );
    }

    if (visited.has(currentId)) break; // safety net against any pre-existing bad data
    visited.add(currentId);

    const current: { parentId: string | null } | null =
      await prisma.category.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      });

    currentId = current?.parentId ?? null;
  }
};

const addCategory = async (payload: CreateCategory): Promise<Category> => {
  const parentId = payload.parentId ?? null;

  if (parentId) {
    await assertParentExists(parentId);
  }

  await assertNoSiblingNameConflict(payload.name, parentId);

  const slug = generateUniqueSlug(payload.name);

  return prisma.category.create({
    data: { ...payload, parentId, slug },
  });
};

const getCategories = async (
  query: QueryBuilderParams,
): Promise<QueryBuilderResult<Category>> => {
  const queryBuilder = new QueryBuilder<
    Category,
    Prisma.CategoryWhereInput,
    Prisma.CategoryInclude
  >(prisma.category, query, {
    searchableFields: categoryConstant.searchableFields,
    filterableFields: categoryConstant.filterableFields,
    selectableFields: categoryConstant.selectableFields,
    includableFields: categoryConstant.includableFields,
    sortableFields: categoryConstant.sortableFields,
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

// Full nested hierarchy in one response — for storefront navigation/sidebar.
// Fixed at 3 levels deep; extend the nested `include` if you need more.
const getCategoryTree = async (): Promise<Category[]> => {
  return prisma.category.findMany({
    where: { deletedAt: null, parentId: null },
    include: {
      children: {
        where: { deletedAt: null },
        include: {
          children: { where: { deletedAt: null } },
        },
      },
    },
  });
};

const getCategoryById = async (categoryId: string): Promise<Category> => {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, deletedAt: null },
  });

  if (!category) {
    throw new AppError("Category not found", status.NOT_FOUND);
  }

  return category;
};

const updateCategoryById = async (
  categoryId: string,
  payload: UpdateCategory,
): Promise<Category> => {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, deletedAt: null },
  });

  if (!category) {
    throw new AppError("Category not found", status.NOT_FOUND);
  }

  if (
    payload.parentId !== undefined &&
    payload.parentId !== category.parentId
  ) {
    if (payload.parentId) {
      await assertParentExists(payload.parentId);
      await assertNoCircularReference(categoryId, payload.parentId);
    }
  }

  const effectiveParentId =
    payload.parentId !== undefined ? payload.parentId : category.parentId;
  const effectiveName = payload.name ?? category.name;

  if (payload.name || payload.parentId !== undefined) {
    await assertNoSiblingNameConflict(
      effectiveName,
      effectiveParentId,
      categoryId,
    );
  }

  return prisma.category.update({
    where: { id: categoryId },
    data: payload,
  });
};

const deleteCategoryById = async (categoryId: string): Promise<Category> => {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, deletedAt: null },
    include: {
      _count: { select: { children: true, productCategories: true } },
    },
  });

  if (!category) {
    throw new AppError("Category not found", status.NOT_FOUND);
  }

  if (category._count.children > 0) {
    throw new AppError(
      "Cannot delete a category that still has subcategories. Remove or reassign them first.",
      status.CONFLICT,
    );
  }

  if (category._count.productCategories > 0) {
    throw new AppError(
      "Cannot delete a category that still has products assigned. Reassign them first.",
      status.CONFLICT,
    );
  }

  return prisma.category.update({
    where: { id: categoryId },
    data: { deletedAt: new Date() },
  });
};

export const categoryService = {
  addCategory,
  getCategories,
  getCategoryTree,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
};
