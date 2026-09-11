import { Router } from "express";
import { authController } from "./auth.controller.js";
import { authValidation } from "./auth.validation.js";
import { validateRequestBody } from "../../middlewares/zod-middleware.js";

const router: Router = Router();

router.post(
  "/register",
  validateRequestBody(authValidation.registerUser),
  authController.registerUser,
);

router.post(
  "/verify-email",
  validateRequestBody(authValidation.verifyEmail),
  authController.verifyEmail,
);

router.post(
  "/login",
  validateRequestBody(authValidation.loginUser),
  authController.loginUser,
);

export { router as authRouter };
