import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async.js";

const addProduct = catchAsync(async (req: Request, res: Response) => {});

const getProducts = catchAsync(async (req: Request, res: Response) => {});

const getProductById = catchAsync(async (req: Request, res: Response) => {});

const updateProductById = catchAsync(async (req: Request, res: Response) => {});

const deleteProductById = catchAsync(async (req: Request, res: Response) => {});

export const productController = {
  addProduct,
  getProducts,
  getProductById,
  updateProductById,
  deleteProductById,
};
