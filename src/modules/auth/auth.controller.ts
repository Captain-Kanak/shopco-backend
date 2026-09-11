import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async.js";
import { authService } from "./auth.service.js";
import { sendResponse } from "../../utils/send-response.js";
import status from "http-status";

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

  return sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});

export const authController = {
  registerUser,
  verifyEmail,
  loginUser,
};
