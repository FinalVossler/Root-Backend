import { Router } from "express";

import protectMiddleware from "../../middleware/protectMiddleware";
import entityController from "./entity.controller";

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
} = entityController;

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

export default router;
