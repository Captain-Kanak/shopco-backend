import { UserRole, User, UserStatus } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import status from "http-status";
import AppError from "../errors/app-error.js";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";

export const authMiddleware = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (!session?.session || !session?.user) {
        throw new AppError(
          "Unauthorized: Session not found",
          status.UNAUTHORIZED,
        );
      }

      const user = session.user as User;

      if (user.status === UserStatus.BANNED) {
        throw new AppError("Unauthorized: User is banned", status.UNAUTHORIZED);
      }

      if (user.deletedAt !== null) {
        throw new AppError(
          "Unauthorized: User is deleted",
          status.UNAUTHORIZED,
        );
      }

      if (roles.length > 0 && !roles.includes(user.role as UserRole)) {
        throw new AppError(
          "Unauthorized: you are not authorized to access this resource",
          status.UNAUTHORIZED,
        );
      }

      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
};
