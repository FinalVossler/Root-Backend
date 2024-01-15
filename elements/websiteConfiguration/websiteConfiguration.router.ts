import express, { Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import superAdminProtectMiddleware from "../../middleware/superAdminProtectMiddleware";
import protectMiddleware from "../../middleware/protectMiddleware";
import { IWebsiteConfiguration } from "./websiteConfiguration.model";
import websiteConfigurationService from "./websiteConfiguration.service";
import { websiteConfigurationToReadDto } from "./websiteConfiguration.toReadDto";
import {
  IWebsiteConfigurationUpdateCommand,
  IWebsiteConfigurationReadDto,
} from "roottypes";

const router = express.Router();

router.post(
  "/update",
  protectMiddleware,
  superAdminProtectMiddleware,
  async (
    req: ConnectedRequest<any, any, IWebsiteConfigurationUpdateCommand, any>,
    res: Response<ResponseDto<IWebsiteConfigurationReadDto>>
  ) => {
    const websiteConfiguration: IWebsiteConfiguration =
      await websiteConfigurationService.update(req.body);

    res.status(200).json({
      data: websiteConfigurationToReadDto(websiteConfiguration),
      success: true,
    });
  }
);

router.get(
  "/",
  async (
    req: ConnectedRequest<any, any, any, any>,
    res: Response<ResponseDto<IWebsiteConfigurationReadDto>>
  ) => {
    const websiteConfiguration: IWebsiteConfiguration =
      await websiteConfigurationService.get();

    res.status(200).json({
      data: websiteConfigurationToReadDto(websiteConfiguration),
      success: true,
    });
  }
);

export default router;
