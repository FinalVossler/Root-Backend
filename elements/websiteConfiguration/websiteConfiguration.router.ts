import express, { Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import superAdminProtectMiddleware from "../../middleware/superAdminProtectMiddleware";
import protectMiddleware from "../../middleware/protectMiddleware";
import WebsiteConfigurationReadDto, {
  toReadDto,
} from "./dto/WebsiteConfigurationReadDto";
import WebsiteConfigurationUpdateCommand from "./dto/WebsiteConfigurationUpdateCommand";
import { IWebsiteConfiguration } from "./websiteConfiguration.model";
import websiteConfigurationService from "./websiteConfiguration.service";

const router = express.Router();

router.post(
  "/update",
  protectMiddleware,
  superAdminProtectMiddleware,
  async (
    req: ConnectedRequest<any, any, WebsiteConfigurationUpdateCommand, any>,
    res: Response<ResponseDto<WebsiteConfigurationReadDto>>
  ) => {
    const websiteConfiguration: IWebsiteConfiguration =
      await websiteConfigurationService.update(req.body, req.user);

    res.status(200).json({
      data: toReadDto(websiteConfiguration),
      success: true,
    });
  }
);

router.get(
  "/",
  async (
    req: ConnectedRequest<any, any, any, any>,
    res: Response<ResponseDto<WebsiteConfigurationReadDto>>
  ) => {
    const websiteConfiguration: IWebsiteConfiguration =
      await websiteConfigurationService.get();

    res.status(200).json({
      data: toReadDto(websiteConfiguration),
      success: true,
    });
  }
);

export default router;
