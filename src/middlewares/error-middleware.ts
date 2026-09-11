import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { env } from "../config/env.js";
import { sendResponse } from "../utils/send-response.js";
import AppError from "../errors/app-error.js";

async function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "Internal Server Error";

  if (env.NODE_ENV === "development") {
    console.error(err);
  }

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  return sendResponse(res, {
    statusCode,
    success: false,
    message,
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

export default errorMiddleware;
