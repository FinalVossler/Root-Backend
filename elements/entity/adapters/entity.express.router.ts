import { Router } from "express";

import protectMiddleware from "../../../middleware/protectMiddleware";
import entityExpressController from "./entity.express.controller";

const router = Router();

const {
  getEntity,
  createEntity,
  updateEntity,
  getEntitiesByModel,
  getAssignedEntitiesByModel,
  deleteEntities,
  searchEntities,
  setCustomDataKeyValue,
  copyEntities,
  generateVariations,
} = entityExpressController;

router.get("/getEntity", protectMiddleware, getEntity);
router.post("/", protectMiddleware, createEntity);
router.put("/", protectMiddleware, updateEntity);
router.post("/getEntitiesByModel", protectMiddleware, getEntitiesByModel);
router.post(
  "/getAssignedEntitiesByModel",
  protectMiddleware,
  getAssignedEntitiesByModel
);
router.delete("/", protectMiddleware, deleteEntities);
router.post("/search", protectMiddleware, searchEntities);
router.post("/setCustomDataKeyValue", protectMiddleware, setCustomDataKeyValue);
router.post("/copy", protectMiddleware, copyEntities);
router.post("/generateVariations", protectMiddleware, generateVariations);

export default router;
