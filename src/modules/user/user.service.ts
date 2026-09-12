import status from "http-status";
import AppError from "../../errors/app-error.js";
import { prisma } from "../../lib/prisma.js";
import { UpdateUser } from "./user.interface.js";
import { Prisma, User, UserStatus } from "@prisma/client";
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

const getUserById = async (userId: string): Promise<User> => {
  const user = await prisma.user.findUnique({
    where: { id: userId, deletedAt: null },
  });

  if (!user) {
    throw new AppError("User not found", status.NOT_FOUND);
  }

  return user;
};

const banUserById = async (userId: string): Promise<User> => {
  const user = await prisma.user.findUnique({
    where: { id: userId, deletedAt: null },
  });

  if (!user) {
    throw new AppError("User not found", status.NOT_FOUND);
  }

  if (user.status === UserStatus.BANNED) {
    throw new AppError("User is already banned", status.CONFLICT);
  }

  const [bannedUser] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.BANNED },
    }),
    prisma.session.deleteMany({ where: { userId } }),
  ]);

  return bannedUser;
};

const deleteUserById = async (userId: string): Promise<User> => {
  const user = await prisma.user.findUnique({
    where: { id: userId, deletedAt: null },
  });

  if (!user) {
    throw new AppError("User not found", status.NOT_FOUND);
  }

  const [deletedUser] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    }),
    prisma.session.deleteMany({ where: { userId } }),
  ]);

  return deletedUser;
};

export const userService = {
  updateProfile,
  getUsers,
  getUserById,
  banUserById,
  deleteUserById,
};
