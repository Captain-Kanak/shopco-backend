import { Response } from "express";

interface ResponseData<T = unknown> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
}

export const sendResponse = <T>(res: Response, resData: ResponseData<T>) => {
  const { statusCode, success, message, data } = resData;

  return res.status(statusCode).json({
    success,
    message,
    data,
  });
};
