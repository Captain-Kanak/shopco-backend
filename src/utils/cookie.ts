import { CookieOptions, Request, Response } from "express";

const getCookie = (req: Request, key: string) => {
  const cookie = req.cookies[key];

  return cookie;
};

const setCookie = (
  res: Response,
  key: string,
  value: string,
  options: CookieOptions,
) => {
  res.cookie(key, value, options);
};

const clearCookie = (res: Response, key: string, options: CookieOptions) => {
  res.clearCookie(key, options);
};

export const cookieUtils = {
  getCookie,
  setCookie,
  clearCookie,
};
