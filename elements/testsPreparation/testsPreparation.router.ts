import express from "express";

import protectMiddleware from "../../middleware/protectMiddleware";
import testsPreparationController from "./testsPreparation.controller";

const { clean, createFile, prepareMarketMaven } = testsPreparationController;

const router = express.Router();

router.post("/clean", protectMiddleware, clean);
router.post("/createFile", protectMiddleware, createFile);
router.post("/prepareMarketMaven", protectMiddleware, prepareMarketMaven);

export default router;
