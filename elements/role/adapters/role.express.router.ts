import { Router } from "express";

import protectMiddleware from "../../../middleware/protectMiddleware";
import roleExpressController from "./role.express.controller";

const router = Router();

router.post("/", protectMiddleware, roleExpressController.createRole);
router.put("/", protectMiddleware, roleExpressController.updateRole);
router.post("/getRoles", protectMiddleware, roleExpressController.getRoles);
router.delete("/", protectMiddleware, roleExpressController.deleteRoles);
router.post("/search", protectMiddleware, roleExpressController.searchRoles);

export default router;
