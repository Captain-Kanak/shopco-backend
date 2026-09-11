import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async.js";
import { authService } from "./auth.service.js";
import { sendResponse } from "../../utils/send-response.js";
import status from "http-status";
import { env } from "../../config/env.js";
import { tokenUtils } from "../../utils/token.js";
import { cookieUtils } from "../../utils/cookie.js";

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

  tokenUtils.setBetterAuthSessionCookie(res, result.token);

  return sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});

const googleLogin = catchAsync(async (req: Request, res: Response) => {
  const redirectPath = req.query.redirect || "/";
  const encodedRedirectPath = encodeURIComponent(redirectPath as string);
  const callbackURL = `${env.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodedRedirectPath}`;

  return res.render("googleRedirect", {
    betterAuthUrl: env.BETTER_AUTH_URL,
    callbackURL,
  });
});

const googleLoginSuccess = catchAsync(async (req: Request, res: Response) => {
  const redirectPath = (req.query.redirect as string) || "/";
  const sessionToken = cookieUtils.getCookie(req, "better-auth.session_token");

  if (!sessionToken) {
    return res.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
  }

  const result = await authService.googleLoginSuccess(sessionToken);

  if (!result.session) {
    return res.redirect(`${env.FRONTEND_URL}/login?error=no_session_found`);
  }

  if (!result.user) {
    return res.redirect(`${env.FRONTEND_URL}/login?error=no_user_found`);
  }

  tokenUtils.setBetterAuthSessionCookie(res, result.session.token);

  const isValidRedirectPath =
    redirectPath.startsWith("/") && !redirectPath.startsWith("//");
  const finalRedirectPath = isValidRedirectPath ? redirectPath : "/";

  return res.redirect(`${env.FRONTEND_URL}${finalRedirectPath}?auth=success`);
});

export const authController = {
  registerUser,
  verifyEmail,
  loginUser,
  googleLogin,
  googleLoginSuccess,
};
