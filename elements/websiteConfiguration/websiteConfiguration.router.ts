import express from "express";

import superAdminProtectMiddleware from "../../middleware/superAdminProtectMiddleware";
import protectMiddleware from "../../middleware/protectMiddleware";
import websiteConfigurationController from "./websiteConfiguration.controller";

const { updateWebsiteConfiguration, getWebsiteConfiguration } =
  websiteConfigurationController;

const router = express.Router();

router.put(
  "/",
  protectMiddleware,
  superAdminProtectMiddleware,
  updateWebsiteConfiguration
);
router.get("/", getWebsiteConfiguration);

export default router;
