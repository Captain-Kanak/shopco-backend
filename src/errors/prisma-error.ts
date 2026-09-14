import { Prisma } from "@prisma/client";
import status from "http-status";
import { ErrorResponse } from "../types/error.type.js";

export const handlePrismaError = (
  err: Prisma.PrismaClientKnownRequestError,
): ErrorResponse => {
  switch (err.code) {
    case "P2002": {
      const driverError = (err.meta?.driverAdapterError as any)?.cause;
      const target = err.meta?.target;

      let fieldLabel = "unknown";

      if (Array.isArray(target)) {
        fieldLabel = target
          .map((f: string) => f.replace(/^"|"$/g, ""))
          .join(", ");
      } else if (driverError?.constraint?.index) {
        const indexName: string = driverError.constraint.index;
        const table: string | undefined = driverError.table;

        fieldLabel = table
          ? indexName.replace(new RegExp(`^${table}_`), "").replace(/_key$/, "")
          : indexName;
      }

      return {
        statusCode: status.CONFLICT,
        message: "Duplicate value",
        errorSources: [
          {
            path: fieldLabel,
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
