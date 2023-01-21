import { Request, Response, Router } from "express";
import userRouter from "./elements/user/user.router";

const router = Router();

router.use("/users", userRouter);
router.use("/", (req: Request, res: Response) => {
  res.status(200).send("Hello!");
});

export default router;
