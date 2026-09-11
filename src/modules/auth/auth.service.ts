import status from "http-status";
import { prisma } from "../../lib/prisma.js";
import { Register } from "./auth.type.js";
import AppError from "../../errors/app-error.js";
import { auth } from "../../lib/auth.js";
import { User } from "better-auth";

const register = async (payload: Register): Promise<User> => {
  try {
    const { name, email, password } = payload;

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

    return result.user;
  } catch (error) {
    throw error;
  }
};

export const authService = {
  register,
};
