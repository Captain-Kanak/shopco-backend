import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async.js";

const addOrder = catchAsync(async (req: Request, res: Response) => {});

const getOrders = catchAsync(async (req: Request, res: Response) => {});

const getOrderById = catchAsync(async (req: Request, res: Response) => {});

const updateOrderById = catchAsync(async (req: Request, res: Response) => {});

const deleteOrderById = catchAsync(async (req: Request, res: Response) => {});

export const orderController = {
  addOrder,
  getOrders,
  getOrderById,
  updateOrderById,
  deleteOrderById,
};
