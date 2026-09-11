import { NextFunction, Request, Response } from "express";
import * as z from "zod";

export const validateRequestBody = (zodObject: z.ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.body?.data) {
      req.body = JSON.parse(req.body.data);
    }

    const parsedResult = zodObject.safeParse(req.body);

    if (!parsedResult.success) {
      return next(parsedResult.error);
    }

    req.body = parsedResult.data;

    next();
  };
};
