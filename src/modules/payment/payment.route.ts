import { Router } from "express";
import express from "express";
// import { paymentController } from "./payment.controller.js";
import { authMiddleware } from "../../middlewares/auth-middleware.js";
import { UserRole } from "@prisma/client";

const router = Router();

// --- Stripe webhook: fundamentally different auth model ---
// Not session-based — verified via Stripe's signing secret against the raw
// request body. Must use express.raw() here, NOT express.json(), because
// Stripe's signature check needs the exact unparsed byte stream; if the
// global express.json() middleware already parsed this body, verification
// will fail. Register this route BEFORE any global JSON body parser touches
// it, or exclude this path from that parser in app.ts.
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
//   paymentController.handleStripeWebhook,
);

// Create a Stripe payment intent for an order — any authenticated user,
// scoped to their own order (service layer must verify the order belongs
// to req.user.id before creating the intent).
router.post(
  "/create-payment-intent",
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
