import express from "express";

import protectMiddleware from "../../middleware/protectMiddleware";
import reactionController from "./reaction.controller";

const router = express.Router();

router.post("/", protectMiddleware, reactionController.createReaction);

export default router;
