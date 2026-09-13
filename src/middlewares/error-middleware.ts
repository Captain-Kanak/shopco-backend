import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { env } from "../config/env.js";
import AppError from "../errors/app-error.js";
import { ErrorSource } from "../types/error.type.js";
import * as z from "zod";
import { handleZodError } from "../errors/zod-error.js";
import { Prisma } from "@prisma/client";
import { handlePrismaError } from "../errors/prisma-error.js";
import { deleteFromCloudinaryById } from "../config/cloudinary.js";

async function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.file) {
    await deleteFromCloudinaryById(req.file.filename).catch(() => {});
  }

  if (req.files) {
    const files = Array.isArray(req.files)
      ? req.files
      : Object.values(req.files).flat();
    await Promise.all(
      files.map((f) => deleteFromCloudinaryById(f.filename).catch(() => {})),
    );
  }

  console.error(err);

  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "Internal Server Error";
  let errorSources: ErrorSource[] = [];

  if (err instanceof z.ZodError) {
    const simplifiedZodErrors = handleZodError(err);

    statusCode = simplifiedZodErrors.statusCode;
    message = simplifiedZodErrors.message;
    errorSources = [...simplifiedZodErrors.errorSources];
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const simplifiedPrismaErrors = handlePrismaError(err);

    statusCode = simplifiedPrismaErrors.statusCode;
    message = simplifiedPrismaErrors.message;
    errorSources = [...simplifiedPrismaErrors.errorSources];
  } else if (err instanceof AppError) {
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
