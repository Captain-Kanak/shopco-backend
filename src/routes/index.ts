import { Router } from "express";
import { authRouter } from "../modules/auth/auth.route.js";

const router: Router = Router();

router.use("/auth", authRouter);

export { router as indexRouter };
