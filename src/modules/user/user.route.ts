import { Router } from "express";
import { userController } from "./user.controller.js";
import { authMiddleware } from "../../middlewares/auth-middleware.js";
import { validateRequestBody } from "../../middlewares/zod-middleware.js";
import { userValidation } from "./user.validation.js";
import { multerUpload } from "../../config/multer.js";
import { UserRole } from "@prisma/client";

const router = Router();

router.patch(
  "/update-profile",
  authMiddleware(),
  multerUpload.single("file"),
  validateRequestBody(userValidation.updateProfile),
  userController.updateProfile,
);

router.get("/", authMiddleware(UserRole.ADMIN), userController.getUsers);

router.patch(
  "/ban/:id",
  authMiddleware(UserRole.ADMIN),
  userController.banUserById,
);

router.delete(
  "/:id",
  authMiddleware(UserRole.ADMIN),
  userController.deleteUserById,
);

export { router as userRouter };
