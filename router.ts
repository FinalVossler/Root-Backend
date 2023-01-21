import { Router } from "express";
import userRouter from "./elements/user/user.router";

const router = Router();

router.use("/users", userRouter);

export default router;
