import { Router } from "express";
import { productController } from "./product.controller.js";
import { authMiddleware } from "../../middlewares/auth-middleware.js";
import { UserRole } from "@prisma/client";
import { validateRequestBody } from "../../middlewares/zod-middleware.js";
import { productValidation } from "./product.validation.js";
import { optionalAuthMiddleware } from "../../middlewares/optional-auth-middleware.js";

const router = Router();

router.post(
  "/",
  authMiddleware(UserRole.ADMIN),
  validateRequestBody(productValidation.createProduct),
  productController.addProduct,
);

router.get("/", optionalAuthMiddleware(), productController.getProducts);

router.get("/:id", optionalAuthMiddleware(), productController.getProductById);

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

// router.post(
//   "/:id/variants",
//   authMiddleware(UserRole.ADMIN),
//   productController.addVariant,
// );

// router.patch(
//   "/:id/variants/:variantId",
//   authMiddleware(UserRole.ADMIN),
//   productController.updateVariant,
// );

// router.delete(
//   "/:id/variants/:variantId",
//   authMiddleware(UserRole.ADMIN),
//   productController.deleteVariant,
// );

// router.post(
//   "/:id/images",
//   authMiddleware(UserRole.ADMIN),
//   multerUpload.array("files"),
//   productController.addImages,
// );

// router.delete(
//   "/:id/images/:imageId",
//   authMiddleware(UserRole.ADMIN),
//   productController.deleteImage,
// );

export { router as productRouter };
