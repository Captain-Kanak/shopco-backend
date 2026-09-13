import { Router } from "express";
import { authController } from "./auth.controller.js";
import { authValidation } from "./auth.validation.js";
import { validateRequestBody } from "../../middlewares/zod-middleware.js";
import { authMiddleware } from "../../middlewares/auth-middleware.js";

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

// http://localhost:5000/api/v1/auth/google
router.get("/google", authController.googleLogin);

router.get("/google/callback", authController.googleLoginSuccess);

router.get("/me", authMiddleware(), authController.getMe);

router.post("/logout", authMiddleware(), authController.logoutUser);

export { router as authRouter };
