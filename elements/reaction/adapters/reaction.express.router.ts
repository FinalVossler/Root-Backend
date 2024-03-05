import express from "express";

import protectMiddleware from "../../../middleware/protectMiddleware";
import reactionExpressController from "./reaction.express.controller";

const router = express.Router();

router.post("/", protectMiddleware, reactionExpressController.createReaction);

export default router;
