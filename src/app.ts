import express, { Application, Request, Response } from "express";
import status from "http-status";
import { sendResponse } from "./utils/send-response.js";

const app: Application = express();

app.get("/", (req: Request, res: Response) => {
  return sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "ShopCo Server is Running Successfully",
  });
});

export default app;
