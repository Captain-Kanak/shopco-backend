import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async.js";
import { authService } from "./auth.service.js";
import { sendResponse } from "../../utils/send-response.js";
import status from "http-status";
import { env } from "../../config/env.js";
import AppError from "../../errors/app-error.js";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.registerUser(req.body);

  return sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  await authService.verifyEmail(req.body);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Email verified successfully",
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body);

  const cookieHeaders = result.headers.getSetCookie();
  cookieHeaders.forEach((cookie) => res.append("Set-Cookie", cookie));

  return sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User logged in successfully",
    data: {
      token: result.token,
      user: result.user,
    },
  });
});

const googleLogin = catchAsync(async (req: Request, res: Response) => {
  const redirectPath = req.query.redirect || "/";
  const encodedRedirectPath = encodeURIComponent(redirectPath as string);
  const callbackURL = `${env.BETTER_AUTH_URL}/api/v1/auth/google/callback?redirect=${encodedRedirectPath}`;

  return res.render("googleRedirect", {
    betterAuthUrl: env.BETTER_AUTH_URL,
    callbackURL,
  });
});

const googleLoginSuccess = catchAsync(async (req: Request, res: Response) => {
  const redirectPath = (req.query.redirect as string) || "/";

  const result = await authService.googleLoginSuccess(req.headers);

  if (!result.session) {
    return res.redirect(`${env.FRONTEND_URL}/login?error=no_session_found`);
  }

  if (!result.user) {
    return res.redirect(`${env.FRONTEND_URL}/login?error=no_user_found`);
  }

  const isValidRedirectPath =
    redirectPath.startsWith("/") && !redirectPath.startsWith("//");
  const finalRedirectPath = isValidRedirectPath ? redirectPath : "/";

  return res.redirect(`${env.FRONTEND_URL}${finalRedirectPath}?auth=success`);
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Not authenticated", status.UNAUTHORIZED);
  }

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User fetched successfully",
    data: req.user,
  });
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
  const responseHeaders = await authService.logoutUser(req.headers);

  responseHeaders.getSetCookie().forEach((cookie) => {
    res.append("Set-Cookie", cookie);
  });

  return sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User logged out successfully",
  });
});

export const authController = {
  registerUser,
  verifyEmail,
  loginUser,
  googleLogin,
  googleLoginSuccess,
  getMe,
  logoutUser,
};
