import { Router } from "express";
import { userController } from "./user.controller.js";
import { authMiddleware } from "../../middlewares/auth-middleware.js";
import { validateRequestBody } from "../../middlewares/zod-middleware.js";
import { userValidation } from "./user.validation.js";
import { multerUpload } from "../../config/multer.js";

const router = Router();

router.patch(
  "/update-profile",
  authMiddleware(),
  multerUpload.single("file"),
  validateRequestBody(userValidation.updateProfile),
  userController.updateProfile,
);

export { router as userRouter };
