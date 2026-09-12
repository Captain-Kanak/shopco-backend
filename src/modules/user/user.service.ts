import status from "http-status";
import AppError from "../../errors/app-error.js";
import { prisma } from "../../lib/prisma.js";
import { UpdateUser } from "./user.interface.js";
import { Prisma, User } from "@prisma/client";
import { deleteFromCloudinaryByUrl } from "../../config/cloudinary.js";
import { QueryBuilder } from "../../query-builder/query-builder.js";
import {
  QueryBuilderParams,
  QueryBuilderResult,
} from "../../query-builder/query-builder.interface.js";
import { userConstant } from "./user.constant.js";

const updateProfile = async (
  userId: string,
  payload: UpdateUser,
): Promise<User> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new AppError("User not found", status.NOT_FOUND);
    }

    if (payload.image && user.image) {
      await deleteFromCloudinaryByUrl(user.image);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: payload,
    });

    return updatedUser;
  } catch (error) {
    throw error;
  }
};

const getUsers = async (
  query: QueryBuilderParams,
): Promise<QueryBuilderResult<User>> => {
  const queryBuilder = new QueryBuilder<
    User,
    Prisma.UserWhereInput,
    Prisma.UserInclude
  >(prisma.user, query, {
    searchableFields: userConstant.searchableFields,
    filterableFields: userConstant.filterableFields,
    selectableFields: userConstant.selectableFields,
    includableFields: userConstant.includableFields,
    sortableFields: userConstant.sortableFields,
  });

  const result = await queryBuilder
    .pagination()
    .sort()
    .where({})
    .search()
    .filter()
    .select()
    .include({
      _count: true,
    })
    .execute();

  return result;
};

const deleteUserById = async (userId: string): Promise<User> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new AppError("User not found", status.NOT_FOUND);
    }

    const deletedUser = await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    return deletedUser;
  } catch (error) {
    throw error;
  }
};

export const userService = {
  updateProfile,
  getUsers,
  deleteUserById,
};
