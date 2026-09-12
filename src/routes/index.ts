import { Router } from "express";
import { authRouter } from "../modules/auth/auth.route.js";
import { userRouter } from "../modules/user/user.route.js";
import { brandRouter } from "../modules/brand/brand.route.js";
import { categoryRouter } from "../modules/category/category.route.js";

const router: Router = Router();

router.use("/auth", authRouter);

router.use("/users", userRouter);

router.use("/brands", brandRouter);

router.use("/categories", categoryRouter);

export { router as indexRouter };
