import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async.js";
import AppError from "../../errors/app-error.js";
import status from "http-status";
import { orderService } from "./order.service.js";
import { sendResponse } from "../../utils/send-response.js";
import { UserRole } from "@prisma/client";

const addOrder = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Not authenticated", status.UNAUTHORIZED);

  const result = await orderService.addOrder(req.user.id, req.body);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Order placed successfully",
    data: result,
  });
});

const getOrders = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Not authenticated", status.UNAUTHORIZED);

  const isAdmin = req.user.role === UserRole.ADMIN;

  const result = await orderService.getOrders(req.query, req.user.id, isAdmin);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Orders fetched successfully",
    data: result,
  });
});

const getOrderById = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Not authenticated", status.UNAUTHORIZED);

  const isAdmin = req.user.role === UserRole.ADMIN;
  const id = req.params.id as string;

  const result = await orderService.getOrderById(id, req.user.id, isAdmin);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Order fetched successfully",
    data: result,
  });
});

const cancelOrder = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Not authenticated", status.UNAUTHORIZED);

  const id = req.params.id as string;

  const result = await orderService.cancelOrder(id, req.user.id, req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Order cancelled successfully",
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await orderService.updateOrderStatus(id, req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Order updated successfully",
    data: result,
  });
});

const deleteOrderById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await orderService.deleteOrderById(id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Order deleted successfully",
    data: result,
  });
});

export const orderController = {
  addOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  deleteOrderById,
};
