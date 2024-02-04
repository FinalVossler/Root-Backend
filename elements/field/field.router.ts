import { Router } from "express";

import protectMiddleware from "../../middleware/protectMiddleware";
import fieldController from "./field.controller";

const router = Router();

router.post("/", protectMiddleware, fieldController.createField);
router.put("/", protectMiddleware, fieldController.updateField);
router.post("/getFields", protectMiddleware, fieldController.getFields);
router.delete("/", protectMiddleware, fieldController.deleteFields);
router.post("/search", protectMiddleware, fieldController.searchFields);
router.post("/copy", protectMiddleware, fieldController.copyFields);

export default router;
