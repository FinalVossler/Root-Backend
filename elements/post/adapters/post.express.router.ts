import { Router } from "express";

import protectMiddleware from "../../../middleware/protectMiddleware";
import postExpressController from "./post.express.controller";

const router = Router();

router.post("/", protectMiddleware, postExpressController.createPost);
router.post(
  "/getUserPosts",
  protectMiddleware,
  postExpressController.getUserPosts
);
router.post("/search", postExpressController.searchPosts);
router.put("/", protectMiddleware, postExpressController.updatePost);
router.delete("/", protectMiddleware, postExpressController.deletePost);

export default router;
