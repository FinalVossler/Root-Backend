import { Request, Response, Router } from "express";

import userRouter from "./elements/user/user.router";
import messageRouter from "./elements/message/message.router";

const router = Router();

router.use("/users", userRouter);
router.use("/messages", messageRouter);
router.use("/", (req: Request, res: Response) => {
  res.status(200).send("Hello!");
});

export default router;
