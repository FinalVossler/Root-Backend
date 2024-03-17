import express from "express";

import protectMiddleware from "../../../middleware/protectMiddleware";
import testsPreparationExpressController from "./testsPreparation.express.controller";

const { clean, createFile, prepareMarketMaven, prepareEcommerce } =
  testsPreparationExpressController;

const router = express.Router();

router.post("/clean", protectMiddleware, clean);
router.post("/createFile", protectMiddleware, createFile);
router.post("/prepareMarketMaven", protectMiddleware, prepareMarketMaven);
router.post("/prepareEcommerce", protectMiddleware, prepareEcommerce);

export default router;
