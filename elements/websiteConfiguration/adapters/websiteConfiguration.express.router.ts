import express from "express";

import superAdminProtectMiddleware from "../../../middleware/superAdminProtectMiddleware";
import protectMiddleware from "../../../middleware/protectMiddleware";
import websiteConfigurationExpressController from "./websiteConfiguration.express.controller";

const { updateWebsiteConfiguration, getWebsiteConfiguration } =
  websiteConfigurationExpressController;

const router = express.Router();

router.put(
  "/",
  protectMiddleware,
  superAdminProtectMiddleware,
  updateWebsiteConfiguration
);
router.get("/", getWebsiteConfiguration);

export default router;
