import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async.js";
import { productService } from "./product.service.js";
import { sendResponse } from "../../utils/send-response.js";
import status from "http-status";
import { UserRole } from "@prisma/client";

const addProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await productService.addProduct(req.body);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Product created successfully",
    data: result,
  });
});

const getProducts = catchAsync(async (req: Request, res: Response) => {
  const isAdmin = req.user?.role === UserRole.ADMIN;
  const result = await productService.getProducts(req.query, isAdmin);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Products fetched successfully",
    data: result,
  });
});

const getProductById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const isAdmin = req.user?.role === UserRole.ADMIN;
  const result = await productService.getProductById(id, isAdmin);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Product fetched successfully",
    data: result,
  });
});

const updateProductById = catchAsync(async (req: Request, res: Response) => {});

const deleteProductById = catchAsync(async (req: Request, res: Response) => {});

export const productController = {
  addProduct,
  getProducts,
  getProductById,
  updateProductById,
  deleteProductById,
};
