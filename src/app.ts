import express, {
  Application,
  json,
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

const app: Application = express();

// view engine setup
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "src/templates"));

// query parser
app.set("query parser", "extended");

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
