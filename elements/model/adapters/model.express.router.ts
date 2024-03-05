import { Router } from "express";
import protectMiddleware from "../../../middleware/protectMiddleware";
import modelExpressController from "./model.express.controller";

const router = Router();

router.post("/", protectMiddleware, modelExpressController.createModel);
router.put("/", protectMiddleware, modelExpressController.updateModel);
router.post("/getModels", protectMiddleware, modelExpressController.getModels);
router.delete("/", protectMiddleware, modelExpressController.deleteModels);
router.post("/search", protectMiddleware, modelExpressController.searchModels);

export default router;
