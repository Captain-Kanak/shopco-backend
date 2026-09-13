import express, {
  Application,
  json,
  raw,
  Request,
  Response,
  urlencoded,
} from "express";
import status from "http-status";
import { sendResponse } from "./utils/send-response.js";
import { indexRouter } from "./routes/index.js";
import errorMiddleware from "./middlewares/error-middleware.js";
import path from "path";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { paymentController } from "./modules/payment/payment.controller.js";

const app: Application = express();

// view engine setup
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "src/templates"));

// query parser
app.set("query parser", "extended");

// stripe webhook
app.use(
  "/api/v1/payments/webhook",
  raw({ type: "application/json" }),
  paymentController.handleStripeWebhook,
);

// middlewares
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  return sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "ShopCo Server is Running Successfully",
  });
});

app.use("/api/auth", toNodeHandler(auth));

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
