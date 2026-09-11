import { UserRole, UserStatus } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { cookieUtils } from "../utils/cookie.js";
import AppError from "../errors/app-error.js";
import { prisma } from "../lib/prisma.js";

export const authMiddleware = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionToken = cookieUtils.getCookie(
        req,
        "better-auth.session_token",
      );

      if (!sessionToken) {
        throw new AppError(
          "Unauthorized: Session token not found",
          status.UNAUTHORIZED,
        );
      }

      if (sessionToken) {
        const session = await prisma.session.findUnique({
          where: {
            token: sessionToken,
            expiresAt: { gt: new Date() },
          },
          include: { user: true },
        });

        if (!session) {
          throw new AppError(
            "Unauthorized: Session not found",
            status.UNAUTHORIZED,
          );
        }

        if (session.user.status === UserStatus.BANNED) {
          throw new AppError(
            "Unauthorized: User is banned",
            status.UNAUTHORIZED,
          );
        }

        if (session.user.deletedAt !== null) {
          throw new AppError(
            "Unauthorized: User is deleted",
            status.UNAUTHORIZED,
          );
        }

        if (roles.length > 0 && !roles.includes(session.user.role)) {
          throw new AppError(
            "Unauthorized: you are not authorized to access this resources",
            status.UNAUTHORIZED,
          );
        }

        req.user = session.user;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
