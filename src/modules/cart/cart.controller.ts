import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async.js";
import { cartService } from "./cart.service.js";
import { sendResponse } from "../../utils/send-response.js";
import status from "http-status";
import AppError from "../../errors/app-error.js";

const addToCart = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Not authenticated", status.UNAUTHORIZED);

  const result = await cartService.addToCart(req.user.id, req.body);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Item added to cart",
    data: result,
  });
});

const getCarts = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Not authenticated", status.UNAUTHORIZED);

  const result = await cartService.getCarts(req.user.id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Cart fetched successfully",
    data: result,
  });
});

const updateCartQuantity = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Not authenticated", status.UNAUTHORIZED);

  const id = req.params.id as string;

  const result = await cartService.updateCartQuantity(
    req.user.id,
    id,
    req.body,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Cart item updated",
    data: result,
  });
});

const removeFromCart = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Not authenticated", status.UNAUTHORIZED);

  const id = req.params.id as string;

  const result = await cartService.removeFromCart(req.user.id, id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Item removed from cart",
    data: result,
  });
});

export const cartController = {
  addToCart,
  getCarts,
  updateCartQuantity,
  removeFromCart,
};
