import express from "express";

import protectMiddleware from "../../../middleware/protectMiddleware";
import pageExpressController from "./page.express.controller";

const router = express.Router();

router.get("/", pageExpressController.getPage);
router.post("/", protectMiddleware, pageExpressController.createPage);
router.put("/", protectMiddleware, pageExpressController.updatePage);
router.delete("/", protectMiddleware, pageExpressController.deletePages);

export default router;
