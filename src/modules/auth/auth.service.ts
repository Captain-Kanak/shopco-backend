import status from "http-status";
import { prisma } from "../../lib/prisma.js";
import { Register } from "./auth.type.js";
import AppError from "../../errors/app-error.js";
import { auth } from "../../lib/auth.js";
import { User } from "@prisma/client";

const registerUser = async (payload: Register): Promise<User> => {
  const { name, email, password } = payload;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      throw new AppError(
        "User already exists with this email",
        status.CONFLICT,
      );
    }

    const result = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    const newUser = await prisma.user.findUnique({
      where: { id: result.user.id },
    });

    if (!newUser) {
      throw new AppError(
        "User registration failed",
        status.INTERNAL_SERVER_ERROR,
      );
    }

    return newUser;
  } catch (error) {
    throw error;
  }
};

export const authService = {
  registerUser,
};
