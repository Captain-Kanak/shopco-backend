import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async.js";

const addBrand = catchAsync(async (req: Request, res: Response) => {});

export const brandController = { addBrand };
