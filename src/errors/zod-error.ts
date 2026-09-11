import status from "http-status";
import * as z from "zod";
import { ErrorResponse, ErrorSource } from "../types/error.type.js";

export const handleZodError = (err: z.ZodError): ErrorResponse => {
  const statusCode = status.BAD_REQUEST;
  const message = "Zod Validation Error";
  const errorSources: ErrorSource[] = [];

  err.issues.forEach((issue) => {
    errorSources.push({
      path: issue.path.join("."),
      message: issue.message,
    });
  });

  return {
    statusCode,
    message,
    errorSources,
  };
};
