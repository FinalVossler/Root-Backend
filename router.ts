import { Request, Response, Router } from "express";

import userRouter from "./elements/user/adapters/user.express.router";
import messageRouter from "./elements/chat/message/adapters/message.express.router";
import postRouter from "./elements/post/adapters/post.express.router";
import pageRouter from "./elements/page/adapters/page.express.router";
import fileRouter from "./elements/file/adapters/file.express.router";
import websiteConfigurationRouter from "./elements/websiteConfiguration/adapters/websiteConfiguration.express.router";
import emailRouter from "./elements/email/adapters/email.express.router";
import fieldRouter from "./elements/field/adapters/field.express.router";
import modelRouter from "./elements/model/adapters/model.express.router";
import entityRouter from "./elements/entity/adapters/entity.express.router";
import roleRouter from "./elements/role/adapters/role.express.router";
import notificationRouter from "./elements/notification/adapters/notification.express.router";
import microFrontendRouter from "./elements/microFontend/adapters/microFrontend.express.router";
import reactionRouter from "./elements/chat/reaction/adapters/reaction.express.router";
import testsPreparationRouter from "./elements/testsPreparation/adapters/testsPreparation.express.router";
import cartRouter from "./elements/ecommerce/cart/adapters/cart.express.router";

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
router.use("/testsPreparation", testsPreparationRouter);
router.use("/cart", cartRouter);

router.use("/", (req: Request, res: Response) => {
  res.status(200).send("Hello!");
});

export default router;
