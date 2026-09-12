import status from "http-status";
import { prisma } from "../../lib/prisma.js";
import { LoginUser, RegisterUser, VerifyEmail } from "./auth.interface.js";
import AppError from "../../errors/app-error.js";
import { auth } from "../../lib/auth.js";
import { User } from "@prisma/client";
import { Session } from "better-auth";
import { fromNodeHeaders } from "better-auth/node";

const registerUser = async (payload: RegisterUser): Promise<User> => {
  const { name, email, password } = payload;

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    throw new AppError("User already exists with this email", status.CONFLICT);
  }

  const result = await auth.api.signUpEmail({
    body: { name, email, password },
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
};

const verifyEmail = async (payload: VerifyEmail): Promise<void> => {
  const { email, otp } = payload;

  const result = await auth.api.verifyEmailOTP({ body: { email, otp } });

  if (!result.status) {
    throw new AppError(
      "Invalid or expired verification code",
      status.BAD_REQUEST,
    );
  }
};

const loginUser = async (
  payload: LoginUser,
): Promise<{ token: string; user: User }> => {
  const { email, password } = payload;

  let result;

  try {
    result = await auth.api.signInEmail({ body: { email, password } });
  } catch {
    throw new AppError("Invalid email or password", status.UNAUTHORIZED);
  }

  const user = await prisma.user.findUnique({
    where: { id: result.user.id, deletedAt: null },
  });

  if (!user) {
    throw new AppError("Invalid email or password", status.UNAUTHORIZED);
  }

  if (!user.emailVerified) {
    throw new AppError(
      "Please verify your email before logging in",
      status.UNAUTHORIZED,
    );
  }

  return { token: result.token, user };
};

const googleLoginSuccess = async (
  requestHeaders: Record<string, string | string[] | undefined>,
): Promise<{ session: Session | null; user: User | null }> => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(requestHeaders),
  });

  if (!session?.session || !session?.user) {
    return { session: null, user: null };
  }

  return { session: session.session, user: session.user as User };
};

const logoutUser = async (
  requestHeaders: Record<string, string | string[] | undefined>,
): Promise<void> => {
  await auth.api.signOut({
    headers: fromNodeHeaders(requestHeaders),
  });
};

export const authService = {
  registerUser,
  verifyEmail,
  loginUser,
  googleLoginSuccess,
  logoutUser,
};
