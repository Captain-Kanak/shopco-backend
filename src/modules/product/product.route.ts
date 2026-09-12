import { Router } from "express";
import { productController } from "./product.controller.js";
import { authMiddleware } from "../../middlewares/auth-middleware.js";
import { UserRole } from "@prisma/client";

const router = Router();

router.post("/", authMiddleware(UserRole.ADMIN), productController.addProduct);

router.get("/", productController.getProducts);

router.get("/:id", productController.getProductById);

router.patch(
  "/:id",
  authMiddleware(UserRole.ADMIN),
  productController.updateProductById,
);

router.delete(
  "/:id",
  authMiddleware(UserRole.ADMIN),
  productController.deleteProductById,
);

export { router as productRouter };
