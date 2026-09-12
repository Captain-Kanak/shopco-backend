import { Router } from "express";
import { orderController } from "./order.controller.js";
import { authMiddleware } from "../../middlewares/auth-middleware.js";
import { UserRole } from "@prisma/client";

const router = Router();

router.post("/", authMiddleware(UserRole.CUSTOMER), orderController.addOrder);

router.get("/", authMiddleware(), orderController.getOrders);

router.get("/:id", authMiddleware(), orderController.getOrderById);

router.patch(
  "/:id",
  authMiddleware(UserRole.CUSTOMER),
  orderController.updateOrderById,
);

router.delete(
  "/:id",
  authMiddleware(UserRole.CUSTOMER),
  orderController.deleteOrderById,
);

export { router as orderRouter };
