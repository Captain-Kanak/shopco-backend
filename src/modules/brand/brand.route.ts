import { Router } from "express";
import { brandController } from "./brand.controller.js";
import { authMiddleware } from "../../middlewares/auth-middleware.js";
import { UserRole } from "@prisma/client";
import { multerUpload } from "../../config/multer.js";
import { validateRequestBody } from "../../middlewares/zod-middleware.js";
import { brandValidation } from "./brand.validation.js";

const router = Router();

router.post(
  "/",
  authMiddleware(UserRole.ADMIN),
  multerUpload.single("file"),
  validateRequestBody(brandValidation.createBrand),
  brandController.addBrand,
);

router.get("/", brandController.getBrands);

router.get("/:id", brandController.getBrandById);

router.patch(
  "/:id",
  authMiddleware(UserRole.ADMIN),
  multerUpload.single("file"),
  validateRequestBody(brandValidation.updateBrand),
  brandController.updateBrandById,
);

router.delete(
  "/:id",
  authMiddleware(UserRole.ADMIN),
  brandController.deleteBrandById,
);

export { router as brandRouter };
