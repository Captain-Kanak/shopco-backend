import { Prisma } from "@prisma/client";
import status from "http-status";
import { ErrorResponse } from "../types/error.type.js";

export const handlePrismaError = (
  err: Prisma.PrismaClientKnownRequestError,
): ErrorResponse => {
  switch (err.code) {
    case "P2002": {
      const target = err.meta?.target;
      const driverFields = (err.meta?.driverAdapterError as any)?.cause
        ?.constraint?.fields;

      const fields = (
        Array.isArray(target)
          ? target
          : Array.isArray(driverFields)
            ? driverFields
            : typeof target === "string"
              ? [target]
              : []
      ).map((f: string) => f.replace(/^"|"$/g, ""));

      return {
        statusCode: status.CONFLICT,
        message: "Duplicate value",
        errorSources: [
          {
            path: fields.length ? fields.join(", ") : "unknown",
            message: "Already exists",
          },
        ],
      };
    }

    case "P2003":
      return {
        statusCode: status.BAD_REQUEST,
        message: "Invalid reference: related record not found or still in use",
        errorSources: [],
      };

    case "P2025":
      return {
        statusCode: status.NOT_FOUND,
        message: "Resource not found",
        errorSources: [],
      };

    default:
      return {
        statusCode: status.BAD_REQUEST,
        message: "Database request error",
        errorSources: [],
      };
  }
};
