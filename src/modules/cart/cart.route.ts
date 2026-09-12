import { Router } from "express";
import { cartController } from "./cart.controller.js";
import { authMiddleware } from "../../middlewares/auth-middleware.js";
import { UserRole } from "@prisma/client";

const router = Router();

router.post("/", authMiddleware(UserRole.CUSTOMER), cartController.addToCart);

router.get("/", authMiddleware(UserRole.CUSTOMER), cartController.getCarts);

router.delete(
  "/:id",
  authMiddleware(UserRole.CUSTOMER),
  cartController.removeFromCart,
);

export { router as cartRouter };
