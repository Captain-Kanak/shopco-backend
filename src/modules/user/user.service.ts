import status from "http-status";
import AppError from "../../errors/app-error.js";
import { prisma } from "../../lib/prisma.js";
import { UpdateUser } from "./user.interface.js";
import { User } from "@prisma/client";

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

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: payload,
    });

    return updatedUser;
  } catch (error) {
    throw error;
  }
};

export const userService = {
  updateProfile,
};
