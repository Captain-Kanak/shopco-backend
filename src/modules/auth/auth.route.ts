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

export { router as authRouter };
