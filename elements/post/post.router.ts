import { Router } from "express";

import protectMiddleware from "../../middleware/protectMiddleware";
import postController from "./post.controller";

const router = Router();

router.post("/", protectMiddleware, postController.createPost);
router.post("/getUserPosts", protectMiddleware, postController.getUserPosts);
router.post("/search", postController.searchPosts);
router.put("/", protectMiddleware, postController.updatePost);
router.delete("/", protectMiddleware, postController.deletePost);

export default router;
