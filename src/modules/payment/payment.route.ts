import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth-middleware.js";
import { UserRole } from "@prisma/client";
import { paymentController } from "./payment.controller.js";
import { validateRequestBody } from "../../middlewares/zod-middleware.js";
import { paymentValidation } from "./payment.validation.js";

const router = Router();

router.post(
  "/intent",
  authMiddleware(),
  validateRequestBody(paymentValidation.createPaymentIntent),
  paymentController.createPaymentIntent,
);

// Get the caller's own payments (service layer branches to "all payments"
// only when the caller is ADMIN — never trust a client-supplied userId).
// router.get("/", authMiddleware(), paymentController.getPayments);

// Get a single payment — owner or ADMIN only, enforced in the service layer.
// router.get("/:id", authMiddleware(), paymentController.getPaymentById);

// Deleting a payment record is a sensitive financial operation — admin only.
// Consider whether this should exist at all vs. a refund flow that updates
// PaymentStatus instead of removing the row (see DATABASE.md Known Limitations
// re: Payment being 1:1 with Order, which makes deletion here even riskier).
router.delete(
  "/:id",
  authMiddleware(UserRole.ADMIN),
  //   paymentController.deletePaymentById,
);

export { router as paymentRouter };
