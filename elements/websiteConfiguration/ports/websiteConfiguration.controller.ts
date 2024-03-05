import { IWebsiteConfigurationUpdateCommand } from "roottypes";

import { websiteConfigurationToReadDto } from "./websiteConfiguration.toReadDto";
import IWebsiteConfiguration from "./interfaces/IWebsiteConfiguration";
import IWebsiteConfigurationController from "./interfaces/IWebsiteConfiguratonController";
import IRequest from "../../../globalTypes/IRequest";
import IWebsiteConfigurationService from "./interfaces/IWebsiteConfigurationService";

const createWebsiteConfigurationController = (
  websiteConfigurationService: IWebsiteConfigurationService
): IWebsiteConfigurationController => ({
  updateWebsiteConfiguration: async (
    req: IRequest<IWebsiteConfigurationUpdateCommand>
  ) => {
    const websiteConfiguration: IWebsiteConfiguration =
      await websiteConfigurationService.update(req.body);

    return {
      data: websiteConfigurationToReadDto(websiteConfiguration),
      success: true,
    };
  },
  getWebsiteConfiguration: async (req: IRequest) => {
    const websiteConfiguration: IWebsiteConfiguration =
      await websiteConfigurationService.get();

    return {
      data: websiteConfigurationToReadDto(websiteConfiguration),
      success: true,
    };
  },
});

export default createWebsiteConfigurationController;
