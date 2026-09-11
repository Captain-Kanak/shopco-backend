import { Prisma } from "@prisma/client";
import status from "http-status";
import { ErrorResponse } from "../types/error.type.js";

export const handlePrismaError = (
  err: Prisma.PrismaClientKnownRequestError,
): ErrorResponse => {
  const target = err.meta?.target;

  const path = Array.isArray(target)
    ? target.join(", ")
    : typeof target === "string"
      ? target
      : "";

  switch (err.code) {
    case "P2002": {
      const fields = (err.meta?.driverAdapterError as any)?.cause?.constraint
        ?.fields;

      return {
        statusCode: status.CONFLICT,
        message: "Duplicate value",
        errorSources: [
          {
            path: Array.isArray(fields) ? fields.join(", ") : "",
            message: "Already exists",
          },
        ],
      };
    }

    case "P2025":
      return {
        statusCode: status.NOT_FOUND,
        message: "Resource not found",
        errorSources: [],
      };

    default:
      return {
        statusCode: status.BAD_REQUEST,
        message: err.message,
        errorSources: [],
      };
  }
};
