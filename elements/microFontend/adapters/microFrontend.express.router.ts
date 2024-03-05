import { Router } from "express";

import protectMiddleware from "../../../middleware/protectMiddleware";
import microFrontendExpressController from "./microFrontend.express.controller";

const { createMicroFrontend, deleteMicroFrontends, searchMicroFrontends } =
  microFrontendExpressController;

const router = Router();

router.post("/", protectMiddleware, createMicroFrontend);
router.put(
  "/",
  protectMiddleware,
  microFrontendExpressController.updateMicroFrontend
);
router.post(
  "/getMicroFrontends",
  microFrontendExpressController.getMicroFrontends
);
router.get("/getById", microFrontendExpressController.getById);
router.delete("/", protectMiddleware, deleteMicroFrontends);
router.post("/search", protectMiddleware, searchMicroFrontends);

export default router;
