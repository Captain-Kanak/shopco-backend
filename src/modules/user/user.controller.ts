import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async.js";
import { User } from "@prisma/client";
import { userService } from "./user.service.js";
import { sendResponse } from "../../utils/send-response.js";
import status from "http-status";

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as User;

  const result = await userService.updateProfile(user.id, req.body);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User profile updated successfully",
    data: result,
  });
});

export const userController = {
  updateProfile,
};
