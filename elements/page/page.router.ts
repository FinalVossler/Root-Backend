import express from "express";

import protectMiddleware from "../../middleware/protectMiddleware";
import pageController from "./page.controller";

const router = express.Router();

router.get("/", pageController.getPage);
router.post("/", protectMiddleware, pageController.createPage);
router.put("/", protectMiddleware, pageController.updatePage);
router.delete("/", protectMiddleware, pageController.deletePages);

export default router;
