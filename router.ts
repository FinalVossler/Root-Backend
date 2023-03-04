import { Request, Response, Router } from "express";

import userRouter from "./elements/user/user.router";
import messageRouter from "./elements/message/message.router";
import postRouter from "./elements/post/post.router";
import pageRouter from "./elements/page/page.router";
import fileRouter from "./elements/file/file.router";
import websiteConfigurationRouter from "./elements/websiteConfiguration/websiteConfiguration.router";
import emailRouter from "./elements/email/email.router";

const router = Router();

router.use("/users", userRouter);
router.use("/messages", messageRouter);
router.use("/posts", postRouter);
router.use("/pages", pageRouter);
router.use("/files", fileRouter);
router.use("/websiteConfigurations", websiteConfigurationRouter);
router.use("/emails", emailRouter);

router.use("/", (req: Request, res: Response) => {
  res.status(200).send("Hello!");
});

export default router;
