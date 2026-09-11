import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async.js";

const register = catchAsync(async (req: Request, res: Response) => {});

export const authController = {
  register,
};
