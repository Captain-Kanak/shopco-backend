import express, { Application, json, Request, Response } from "express";
import status from "http-status";
import { sendResponse } from "./utils/send-response.js";
import { indexRouter } from "./routes/index.js";
import errorMiddleware from "./middlewares/error-middleware.js";

const app: Application = express();

// json middleware
app.use(json());

app.get("/", (req: Request, res: Response) => {
  return sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "ShopCo Server is Running Successfully",
  });
});

app.use("/api/v1", indexRouter);

app.use((req: Request, res: Response) => {
  return res.status(status.NOT_FOUND).json({
    success: false,
    message: "Not Found",
    route: req.originalUrl,
  });
});

app.use(errorMiddleware);

export default app;
