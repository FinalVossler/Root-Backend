import express from "express";

import protectMiddleware from "../../../middleware/protectMiddleware";
import fileExpressController from "./file.express.controller";

const router = express.Router();

router.post(
  "/getUserAndSelectedFiles",
  protectMiddleware,
  fileExpressController.getUserAndSelectedFiles
);

router.post(
  "/getUnOwnedAndSelectedFiles",
  protectMiddleware,
  fileExpressController.getUnOwnedAndSelectedFiles
);

export default router;
