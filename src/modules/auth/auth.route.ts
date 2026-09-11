import { Router } from "express";
import { authController } from "./auth.controller.js";

const router: Router = Router();

router.post("/register", authController.register);

export { router as authRouter };
