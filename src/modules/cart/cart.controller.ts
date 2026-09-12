import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async.js";

const addToCart = catchAsync(async (req: Request, res: Response) => {});

const getCarts = catchAsync(async (req: Request, res: Response) => {});

const removeFromCart = catchAsync(async (req: Request, res: Response) => {});

export const cartController = {
  addToCart,
  getCarts,
  removeFromCart,
};
