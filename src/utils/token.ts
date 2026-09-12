import { Response } from "express";
import ms, { StringValue } from "ms";
import { env } from "../config/env.js";
import { cookieUtils } from "./cookie.js";

const setBetterAuthSessionCookie = (res: Response, token: string) => {
  cookieUtils.setCookie(res, "better-auth.session_token", token, {
    secure: true,
    sameSite: "none",
    httpOnly: true,
    path: "/",
    maxAge: Math.floor(ms(env.BETTER_AUTH_SESSION_EXPIRES_IN as StringValue)),
  });
};

const clearBetterAuthSessionCookie = (res: Response) => {
  cookieUtils.clearCookie(res, "better-auth.session_token", {
    secure: true,
    sameSite: "none",
    httpOnly: true,
    path: "/",
  });
};

export const tokenUtils = {
  setBetterAuthSessionCookie,
  clearBetterAuthSessionCookie,
};
