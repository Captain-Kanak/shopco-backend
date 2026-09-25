import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async.js";

const createPaymentIntent = catchAsync(
  async (req: Request, res: Response) => {},
);

const handleStripeWebhook = catchAsync(
  async (req: Request, res: Response) => {},
);

export const paymentController = {
  createPaymentIntent,
  handleStripeWebhook,
};
