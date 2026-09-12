import { Router } from "express";
import { userController } from "./user.controller.js";
import { authMiddleware } from "../../middlewares/auth-middleware.js";
import { validateRequestBody } from "../../middlewares/zod-middleware.js";
import { userValidation } from "./user.validation.js";
import { multerUpload } from "../../config/multer.js";
import { UserRole } from "@prisma/client";

const router = Router();

router.patch(
  "/me",
  authMiddleware(),
  multerUpload.single("file"),
  validateRequestBody(userValidation.updateProfile),
  userController.updateProfile,
);

// router.post("/forgot-password", validateRequestBody(...), userController.forgotPassword);

// router.post("/reset-password", validateRequestBody(...), userController.resetPassword);

router.get("/", authMiddleware(UserRole.ADMIN), userController.getUsers);

router.get("/:id", authMiddleware(UserRole.ADMIN), userController.getUserById);

router.patch(
  "/:id/ban",
  authMiddleware(UserRole.ADMIN),
  userController.banUserById,
);

router.delete(
  "/:id",
  authMiddleware(UserRole.ADMIN),
  userController.deleteUserById,
);

export { router as userRouter };
