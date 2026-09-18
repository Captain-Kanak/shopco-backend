import { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import { User, UserStatus } from "@prisma/client";

export const optionalAuthMiddleware = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (session?.session && session?.user) {
        const user = session.user as User;

        if (user.status !== UserStatus.BANNED && user.deletedAt === null) {
          req.user = user;
        }
      }

      next();
    } catch {
      next();
    }
  };
};
