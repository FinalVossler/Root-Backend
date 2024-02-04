import { Router } from "express";
import protectMiddleware from "../../middleware/protectMiddleware";
import modelController from "./mode.controller";

const router = Router();

router.post("/", protectMiddleware, modelController.createModel);
router.put("/", protectMiddleware, modelController.updateModel);
router.post("/getModels", protectMiddleware, modelController.getModels);
router.delete("/", protectMiddleware, modelController.deleteModels);
router.post("/search", protectMiddleware, modelController.searchModels);

export default router;
