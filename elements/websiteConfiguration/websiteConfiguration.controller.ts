import { Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import { IWebsiteConfiguration } from "./websiteConfiguration.model";
import websiteConfigurationService from "./websiteConfiguration.service";
import { websiteConfigurationToReadDto } from "./websiteConfiguration.toReadDto";
import {
  IWebsiteConfigurationUpdateCommand,
  IWebsiteConfigurationReadDto,
} from "roottypes";

const websiteConfigurationController = {
  updateWebsiteConfiguration: async (
    req: ConnectedRequest<any, any, IWebsiteConfigurationUpdateCommand, any>,
    res: Response<ResponseDto<IWebsiteConfigurationReadDto>>
  ) => {
    const websiteConfiguration: IWebsiteConfiguration =
      await websiteConfigurationService.update(req.body);

    res.status(200).json({
      data: websiteConfigurationToReadDto(websiteConfiguration),
      success: true,
    });
  },
  getWebsiteConfiguration: async (
    req: ConnectedRequest<any, any, any, any>,
    res: Response<ResponseDto<IWebsiteConfigurationReadDto>>
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
