import { Router } from "express";
import { authRouter } from "../modules/auth/auth.route.js";
import { userRouter } from "../modules/user/user.route.js";

const router: Router = Router();

router.use("/auth", authRouter);

router.use("/users", userRouter);

export { router as indexRouter };
