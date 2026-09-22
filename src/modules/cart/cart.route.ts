import { Router } from "express";
import { cartController } from "./cart.controller.js";
import { authMiddleware } from "../../middlewares/auth-middleware.js";

const router = Router();

router.post("/", authMiddleware(), cartController.addToCart);

router.get("/", authMiddleware(), cartController.getCarts);

router.patch("/:id", authMiddleware(), cartController.updateCartQuantity);

router.delete("/:id", authMiddleware(), cartController.removeFromCart);

export { router as cartRouter };
