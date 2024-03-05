import { Response } from "express";

import IConnectedRequest from "../../globalTypes/IConnectedRequest";
import IResponseDto from "../../globalTypes/IResponseDto";
import { IWebsiteConfiguration } from "./websiteConfiguration.model";
import websiteConfigurationService from "./websiteConfiguration.service";
import { websiteConfigurationToReadDto } from "./websiteConfiguration.toReadDto";
import {
  IWebsiteConfigurationUpdateCommand,
  IWebsiteConfigurationReadDto,
} from "roottypes";

const websiteConfigurationController = {
  updateWebsiteConfiguration: async (
    req: IConnectedRequest<any, any, IWebsiteConfigurationUpdateCommand, any>,
    res: Response<IResponseDto<IWebsiteConfigurationReadDto>>
  ) => {
    const websiteConfiguration: IWebsiteConfiguration =
      await websiteConfigurationService.update(req.body);

    res.status(200).json({
      data: websiteConfigurationToReadDto(websiteConfiguration),
      success: true,
    });
  },
  getWebsiteConfiguration: async (
    req: IConnectedRequest<any, any, any, any>,
    res: Response<IResponseDto<IWebsiteConfigurationReadDto>>
  ) => {
    const websiteConfiguration: IWebsiteConfiguration =
      await websiteConfigurationService.get();

    res.status(200).json({
      data: websiteConfigurationToReadDto(websiteConfiguration),
      success: true,
    });
  },
};

export default websiteConfigurationController;
