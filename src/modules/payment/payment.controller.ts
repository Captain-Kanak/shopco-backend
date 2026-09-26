import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async.js";
import AppError from "../../errors/app-error.js";
import status from "http-status";
import { paymentService } from "./payment.service.js";
import { sendResponse } from "../../utils/send-response.js";

const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Not authenticated", status.UNAUTHORIZED);

  const result = await paymentService.createPaymentIntent(
    req.user.id,
    req.body,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Payment intent created successfully",
    data: result,
  });
});

const handleStripeWebhook = catchAsync(
  async (req: Request, res: Response) => {},
);

export const paymentController = {
  createPaymentIntent,
  handleStripeWebhook,
};
