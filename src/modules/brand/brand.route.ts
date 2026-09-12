import { Router } from "express";
import { brandController } from "./brand.controller.js";
import { authMiddleware } from "../../middlewares/auth-middleware.js";
import { UserRole } from "@prisma/client";

const router = Router();

router.post("/", authMiddleware(UserRole.ADMIN), brandController.addBrand);

export { router as brandRouter };
