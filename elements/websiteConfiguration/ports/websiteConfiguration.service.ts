import { IWebsiteConfigurationUpdateCommand } from "roottypes";

import IWebsiteConfiguration from "./interfaces/IWebsiteConfiguration";
import IWebsiteConfigurationService from "./interfaces/IWebsiteConfigurationService";
import IWebsiteConfigurationRepository from "./interfaces/IWebsiteConfigurationRepository";

const createWebsiteConfigurationService = (
  websiteConfigurationRepository: IWebsiteConfigurationRepository
): IWebsiteConfigurationService => ({
  update: async (
    command: IWebsiteConfigurationUpdateCommand
  ): Promise<IWebsiteConfiguration> => {
    const configuration: IWebsiteConfiguration =
      await websiteConfigurationRepository.update(command);

    return configuration;
  },
  get: async (): Promise<IWebsiteConfiguration> => {
    return await websiteConfigurationRepository.get();
  },
});

export default createWebsiteConfigurationService;
