import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async.js";

const addCategory = catchAsync(async (req: Request, res: Response) => {});

const getCategories = catchAsync(async (req: Request, res: Response) => {});

const getCategoryById = catchAsync(async (req: Request, res: Response) => {});

const updateCategoryById = catchAsync(
  async (req: Request, res: Response) => {},
);

const deleteCategoryById = catchAsync(
  async (req: Request, res: Response) => {},
);

export const categoryController = {
  addCategory,
  getCategories,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
};
