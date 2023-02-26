import express, { Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import protectMiddleware from "../../middleware/protectMiddleware";
import { Role } from "../user/user.model";
import WebsiteConfigurationReadDto, {
  toReadDto,
} from "./dto/WebsiteConfigurationReadDto";
import WebsiteConfigurationUpdateCommand from "./dto/WebsiteConfigurationUpdateCommand";
import { IWebsiteConfiguration } from "./websiteConfiguration.model";
import websiteConfigurationRepository from "./websiteConfiguration.repository";

const router = express.Router();

router.post(
  "/update",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, WebsiteConfigurationUpdateCommand, any>,
    res: Response<ResponseDto<WebsiteConfigurationReadDto>>
  ) => {
    if (req.user.role !== Role.Admin) {
      throw new Error("Unauthorized");
    }

    const websiteConfiguration: IWebsiteConfiguration =
      await websiteConfigurationRepository.update(req.body);

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
      await websiteConfigurationRepository.get();

    res.status(200).json({
      data: toReadDto(websiteConfiguration),
      success: true,
    });
  }
);

export default router;
