import { Router } from "express";
import express from "express";
// import { paymentController } from "./payment.controller.js";
import { authMiddleware } from "../../middlewares/auth-middleware.js";
import { UserRole } from "@prisma/client";

const router = Router();

// Create a Stripe payment intent for an order — any authenticated user,
// scoped to their own order (service layer must verify the order belongs
// to req.user.id before creating the intent).
router.post(
  "/intent",
  authMiddleware(),
  //   paymentController.createPaymentIntent,
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
