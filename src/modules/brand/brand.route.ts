import { Router } from "express";
import { brandController } from "./brand.controller.js";
import { authMiddleware } from "../../middlewares/auth-middleware.js";
import { UserRole } from "@prisma/client";

const router = Router();

router.post("/", authMiddleware(UserRole.ADMIN), brandController.addBrand);

router.get("/", brandController.getBrands);

router.get("/:id", brandController.getBrandById);

router.patch(
  "/:id",
  authMiddleware(UserRole.ADMIN),
  brandController.updateBrandById,
);

router.delete(
  "/:id",
  authMiddleware(UserRole.ADMIN),
  brandController.deleteBrandById,
);

export { router as brandRouter };
