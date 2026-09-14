import { Router } from "express";
import { categoryController } from "./category.controller.js";
import { authMiddleware } from "../../middlewares/auth-middleware.js";
import { validateRequestBody } from "../../middlewares/zod-middleware.js";
import { categoryValidation } from "./category.validation.js";
import { UserRole } from "@prisma/client";

const router = Router();

router.post(
  "/",
  authMiddleware(UserRole.ADMIN),
  validateRequestBody(categoryValidation.createCategory),
  categoryController.addCategory,
);

router.get("/", categoryController.getCategories);

router.get("/tree", categoryController.getCategoryTree);

router.get("/:id", categoryController.getCategoryById);

router.patch(
  "/:id",
  authMiddleware(UserRole.ADMIN),
  validateRequestBody(categoryValidation.updateCategory),
  categoryController.updateCategoryById,
);

router.delete(
  "/:id",
  authMiddleware(UserRole.ADMIN),
  categoryController.deleteCategoryById,
);

export { router as categoryRouter };
