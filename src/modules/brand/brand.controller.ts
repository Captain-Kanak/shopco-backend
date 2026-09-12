import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async.js";

const addBrand = catchAsync(async (req: Request, res: Response) => {});

const getBrands = catchAsync(async (req: Request, res: Response) => {});

const getBrandById = catchAsync(async (req: Request, res: Response) => {});

const updateBrandById = catchAsync(async (req: Request, res: Response) => {});

const deleteBrandById = catchAsync(async (req: Request, res: Response) => {});

export const brandController = {
  addBrand,
  getBrands,
  getBrandById,
  updateBrandById,
  deleteBrandById,
};
