import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async.js";

const handleStripeWebhook = catchAsync(
  async (req: Request, res: Response) => {},
);

export const paymentController = {
  handleStripeWebhook,
};
