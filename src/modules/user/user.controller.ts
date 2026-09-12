import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async.js";
import { User } from "@prisma/client";
import { userService } from "./user.service.js";
import { sendResponse } from "../../utils/send-response.js";
import status from "http-status";

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as User;

  const payload = {
    ...req.body,
    ...(req.body.dateOfBirth && {
      dateOfBirth: new Date(req.body.dateOfBirth),
    }),
    ...(req.file && { image: req.file.path }),
  };

  const result = await userService.updateProfile(user.id, payload);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User profile updated successfully",
    data: result,
  });
});

const getUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getUsers(req.query);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Users fetched successfully",
    data: result,
  });
});

export const userController = {
  updateProfile,
  getUsers,
};
