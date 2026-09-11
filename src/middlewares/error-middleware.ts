import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { env } from "../config/env.js";
import AppError from "../errors/app-error.js";
import { ErrorSource } from "../types/error.type.js";
import * as z from "zod";
import { handleZodError } from "../errors/zod-error.js";

async function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "Internal Server Error";
  let errorSources: ErrorSource[] = [];

  if (env.NODE_ENV === "development") {
    console.error(err);
  }

  if (err instanceof z.ZodError) {
    const simplifiedZodErrors = handleZodError(err);

    statusCode = simplifiedZodErrors.statusCode;
    message = simplifiedZodErrors.message;
    errorSources = [...simplifiedZodErrors.errorSources];
  }

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

export default errorMiddleware;
