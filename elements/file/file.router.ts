import express from "express";

import protectMiddleware from "../../middleware/protectMiddleware";
import fileController from "./file.controller";

const router = express.Router();

router.post(
  "/getUserAndSelectedFiles",
  protectMiddleware,
  fileController.getUserAndSelectedFiles
);

router.post(
  "/getUnOwnedAndSelectedFiles",
  protectMiddleware,
  fileController.getUnOwnedAndSelectedFiles
);

export default router;
