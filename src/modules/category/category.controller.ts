import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async.js";
import { categoryService } from "./category.service.js";
import { sendResponse } from "../../utils/send-response.js";
import status from "http-status";

const addCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await categoryService.addCategory(req.body);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Category created successfully",
    data: result,
  });
});

const getCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await categoryService.getCategories(req.query);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Categories fetched successfully",
    data: result,
  });
});

const getCategoryTree = catchAsync(async (req: Request, res: Response) => {
  const result = await categoryService.getCategoryTree();

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Category tree fetched successfully",
    data: result,
  });
});

const getCategoryById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await categoryService.getCategoryById(id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Category fetched successfully",
    data: result,
  });
});

const updateCategoryById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await categoryService.updateCategoryById(id, req.body);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Category updated successfully",
    data: result,
  });
});

const deleteCategoryById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await categoryService.deleteCategoryById(id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Category deleted successfully",
    data: result,
  });
});

export const categoryController = {
  addCategory,
  getCategories,
  getCategoryTree,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
};
