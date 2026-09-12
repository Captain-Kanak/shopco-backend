import { NextFunction, Request, Response } from "express";
import * as z from "zod";
import AppError from "../errors/app-error.js";
import status from "http-status";

export const validateRequestBody = (zodObject: z.ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.body?.data) {
      try {
        req.body = JSON.parse(req.body.data);
      } catch {
        throw new AppError("Invalid JSON in 'data' field", status.BAD_REQUEST);
      }
    }

    const parsedResult = zodObject.safeParse(req.body);

    if (!parsedResult.success) {
      return next(parsedResult.error);
    }

    req.body = parsedResult.data;

    next();
  };
};
