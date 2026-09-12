import { Router } from "express";
import { categoryController } from "./category.controller.js";
import { authMiddleware } from "../../middlewares/auth-middleware.js";
import { UserRole } from "@prisma/client";

const router = Router();

router.post(
  "/",
  authMiddleware(UserRole.ADMIN),
  categoryController.addCategory,
);

router.get("/", categoryController.getCategories);

router.get("/:id", categoryController.getCategoryById);

router.patch(
  "/:id",
  authMiddleware(UserRole.ADMIN),
  categoryController.updateCategoryById,
);

router.delete(
  "/:id",
  authMiddleware(UserRole.ADMIN),
  categoryController.deleteCategoryById,
);

export { router as categoryRouter };
