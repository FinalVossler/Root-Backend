import { Router } from "express";

import protectMiddleware from "../../middleware/protectMiddleware";
import roleController from "./role.controller";

const router = Router();

router.post("/", protectMiddleware, roleController.createRole);
router.put("/", protectMiddleware, roleController.updateRole);
router.post("/getRoles", protectMiddleware, roleController.getRoles);
router.delete("/", protectMiddleware, roleController.deleteRoles);
router.post("/search", protectMiddleware, roleController.searchRoles);

export default router;
