import { Router } from "express";

import protectMiddleware from "../../middleware/protectMiddleware";
import microFrontendController from "./microFrontend.controller";

const { createMicroFrontend, deleteMicroFrontends, searchMicroFrontends } =
  microFrontendController;

const router = Router();

router.post("/", protectMiddleware, createMicroFrontend);
router.put("/", protectMiddleware, microFrontendController.updateMicroFrontend);
router.post("/getMicroFrontends", microFrontendController.getMicroFrontends);
router.get("/getById", microFrontendController.getById);
router.delete("/", protectMiddleware, deleteMicroFrontends);
router.post("/search", protectMiddleware, searchMicroFrontends);

export default router;
