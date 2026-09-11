import status from "http-status";
import { prisma } from "../../lib/prisma.js";
import { LoginUser, RegisterUser, VerifyEmail } from "./auth.type.js";
import AppError from "../../errors/app-error.js";
import { auth } from "../../lib/auth.js";
import { User } from "@prisma/client";

const registerUser = async (payload: RegisterUser): Promise<User> => {
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

const verifyEmail = async (payload: VerifyEmail): Promise<void> => {
  try {
    const { email, otp } = payload;

    const result = await auth.api.verifyEmailOTP({
      body: {
        email,
        otp,
      },
    });

    if (result.status && !result.user.emailVerified) {
      await prisma.user.update({
        where: {
          email,
        },
        data: {
          emailVerified: true,
        },
      });
    }
  } catch (error) {
    throw error;
  }
};

const loginUser = async (
  payload: LoginUser,
): Promise<{ token: string; user: User }> => {
  try {
    const { email, password } = payload;

    const user = await prisma.user.findUnique({
      where: {
        email,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new AppError("User not exist with this email", status.NOT_FOUND);
    }

    if (!user.emailVerified) {
      throw new AppError("Email not verified", status.UNAUTHORIZED);
    }

    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    return {
      token: result.token,
      user,
    };
  } catch (error) {
    throw error;
  }
};

export const authService = {
  registerUser,
  verifyEmail,
  loginUser,
};
