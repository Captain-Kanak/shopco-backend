import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async.js";
import { brandService } from "./brand.service.js";
import { sendResponse } from "../../utils/send-response.js";
import status from "http-status";

const addBrand = catchAsync(async (req: Request, res: Response) => {
  const payload = {
    ...req.body,
    ...(req.file && { logo: req.file.path }),
  };

  const result = await brandService.addBrand(payload);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Brand created successfully",
    data: result,
  });
});

const getBrands = catchAsync(async (req: Request, res: Response) => {
  const result = await brandService.getBrands(req.query);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Brands fetched successfully",
    data: result,
  });
});

const getBrandById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await brandService.getBrandById(id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Brand fetched successfully",
    data: result,
  });
});

const updateBrandById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const payload = {
    ...req.body,
    ...(req.file && { logo: req.file.path }),
  };

  const result = await brandService.updateBrandById(id, payload);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Brand updated successfully",
    data: result,
  });
});

const deleteBrandById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await brandService.deleteBrandById(id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Brand deleted successfully",
    data: result,
  });
});

export const brandController = {
  addBrand,
  getBrands,
  getBrandById,
  updateBrandById,
  deleteBrandById,
};
