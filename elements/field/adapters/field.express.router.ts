import { Router } from "express";

import protectMiddleware from "../../../middleware/protectMiddleware";
import fieldExpressController from "./field.express.controller";

const router = Router();

router.post("/", protectMiddleware, fieldExpressController.createField);
router.put("/", protectMiddleware, fieldExpressController.updateField);
router.post("/getFields", protectMiddleware, fieldExpressController.getFields);
router.delete("/", protectMiddleware, fieldExpressController.deleteFields);
router.post("/search", protectMiddleware, fieldExpressController.searchFields);
router.post("/copy", protectMiddleware, fieldExpressController.copyFields);

export default router;
