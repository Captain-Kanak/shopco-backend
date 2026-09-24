import { Router } from "express";
import { orderController } from "./order.controller.js";
import { authMiddleware } from "../../middlewares/auth-middleware.js";
import { UserRole } from "@prisma/client";
import { validateRequestBody } from "../../middlewares/zod-middleware.js";
import { orderValidation } from "./order.validation.js";

const router = Router();

router.post(
  "/",
  authMiddleware(),
  validateRequestBody(orderValidation.createOrder),
  orderController.addOrder,
);

router.get("/", authMiddleware(), orderController.getOrders);

router.get("/:id", authMiddleware(), orderController.getOrderById);

router.patch(
  "/:id/cancel",
  authMiddleware(),
  validateRequestBody(orderValidation.cancelOrder),
  orderController.cancelOrder,
);

router.patch(
  "/:id/status",
  authMiddleware(UserRole.ADMIN),
  validateRequestBody(orderValidation.updateOrderStatus),
  orderController.updateOrderStatus,
);

router.delete(
  "/:id",
  authMiddleware(UserRole.ADMIN),
  orderController.deleteOrderById,
);

export { router as orderRouter };
