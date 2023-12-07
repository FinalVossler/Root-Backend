import { Request, Response, Router } from "express";

import userRouter from "./elements/user/user.router";
import messageRouter from "./elements/message/message.router";
import postRouter from "./elements/post/post.router";
import pageRouter from "./elements/page/page.router";
import fileRouter from "./elements/file/file.router";
import websiteConfigurationRouter from "./elements/websiteConfiguration/websiteConfiguration.router";
import emailRouter from "./elements/email/email.router";
import fieldRouter from "./elements/field/field.router";
import modelRouter from "./elements/model/model.router";
import entityRouter from "./elements/entity/entity.router";
import roleRouter from "./elements/role/role.router";
import notificationRouter from "./elements/notification/notification.router";
import microFrontendRouter from "./elements/microFontend/microFrontend.router";
import reactionRouter from "./elements/reaction/reaction.router";
import cypressRouter from "./elements/cypress/cypress.router";

const router = Router();

router.use("/users", userRouter);
router.use("/messages", messageRouter);
router.use("/posts", postRouter);
router.use("/pages", pageRouter);
router.use("/files", fileRouter);
router.use("/websiteConfigurations", websiteConfigurationRouter);
router.use("/emails", emailRouter);
router.use("/fields", fieldRouter);
router.use("/models", modelRouter);
router.use("/entities", entityRouter);
router.use("/roles", roleRouter);
router.use("/notifications", notificationRouter);
router.use("/microFrontends", microFrontendRouter);
router.use("/reactions", reactionRouter);
router.use("/cypress", cypressRouter);

router.use("/", (req: Request, res: Response) => {
  res.status(200).send("Hello!");
});

export default router;
