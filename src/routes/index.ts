import { Router } from "express";
import { authRouter } from "../modules/auth/auth.route.js";
import { userRouter } from "../modules/user/user.route.js";
import { brandRouter } from "../modules/brand/brand.route.js";
import { categoryRouter } from "../modules/category/category.route.js";
import { productRouter } from "../modules/product/product.route.js";
import { cartRouter } from "../modules/cart/cart.route.js";

const router: Router = Router();

router.use("/auth", authRouter);

router.use("/users", userRouter);

router.use("/brands", brandRouter);

router.use("/categories", categoryRouter);

router.use("/products", productRouter);

router.use("/carts", cartRouter);

export { router as indexRouter };
