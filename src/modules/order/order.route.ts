import { Router } from "express";
import { orderController } from "./order.controller.js";
import { authMiddleware } from "../../middlewares/auth-middleware.js";
import { UserRole } from "@prisma/client";

const router = Router();

router.post("/", authMiddleware(), orderController.addOrder);

router.get("/", authMiddleware(), orderController.getOrders);

router.get("/:id", authMiddleware(), orderController.getOrderById);

// router.patch("/:id/cancel", authMiddleware(), orderController.cancelOrder);

// router.patch(
//   "/:id/status",
//   authMiddleware(UserRole.ADMIN),
//   orderController.updateOrderStatus,
// );

router.delete(
  "/:id",
  authMiddleware(UserRole.ADMIN),
  orderController.deleteOrderById,
);

export { router as orderRouter };
