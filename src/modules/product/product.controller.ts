import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async.js";
import { productService } from "./product.service.js";
import { sendResponse } from "../../utils/send-response.js";
import status from "http-status";
import { UserRole } from "@prisma/client";
import AppError from "../../errors/app-error.js";

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

const updateProductById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await productService.updateProductById(id, req.body);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Product updated successfully",
    data: result,
  });
});

const deleteProductById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await productService.deleteProductById(id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Product deleted successfully",
    data: result,
  });
});

const addVariantToProduct = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await productService.addVariantToProduct(id, req.body);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Variant added successfully",
    data: result,
  });
});

const updateVariantById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const variantId = req.params.variantId as string;

  const result = await productService.updateVariantById(
    id,
    variantId,
    req.body,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Variant updated successfully",
    data: result,
  });
});

const deleteVariantById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const variantId = req.params.variantId as string;

  const result = await productService.deleteVariantById(id, variantId);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Variant deleted successfully",
    data: result,
  });
});

const addImagesToProduct = catchAsync(async (req: Request, res: Response) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw new AppError(
      "At least one image file is required",
      status.BAD_REQUEST,
    );
  }

  const id = req.params.id as string;

  const result = await productService.addImagesToProduct(
    id,
    req.files as Express.Multer.File[],
    req.body.variantId,
  );

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Images uploaded successfully",
    data: result,
  });
});

const deleteImageById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const imageId = req.params.imageId as string;

  const result = await productService.deleteImageById(id, imageId);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Image deleted successfully",
    data: result,
  });
});

export const productController = {
  addProduct,
  getProducts,
  getProductById,
  updateProductById,
  deleteProductById,
  addVariantToProduct,
  updateVariantById,
  deleteVariantById,
  addImagesToProduct,
  deleteImageById,
};
