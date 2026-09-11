import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async.js";
import { authService } from "./auth.service.js";
import { sendResponse } from "../../utils/send-response.js";
import status from "http-status";

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);

  return sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

export const authController = {
  register,
};
