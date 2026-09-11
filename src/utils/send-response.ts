import { Response } from "express";

interface ResponseData<T = unknown> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

export const sendResponse = <T>(res: Response, resData: ResponseData<T>) => {
  const { statusCode, success, message, data, error } = resData;

  return res.status(statusCode).json({
    success,
    message,
    data,
    error,
  });
};
