import { IWebsiteConfigurationUpdateCommand } from "roottypes";

import websiteConfigurationMongooseRepository from "../adapters/websiteConfiguration.mongoose.repository";
import IWebsiteConfiguration from "./interfaces/IWebsiteConfiguration";
import IWebsiteConfigurationService from "./interfaces/IWebsiteConfigurationService";

const createWebsiteConfigurationService = (): IWebsiteConfigurationService => ({
  update: async (
    command: IWebsiteConfigurationUpdateCommand
  ): Promise<IWebsiteConfiguration> => {
    const configuration: IWebsiteConfiguration =
      await websiteConfigurationMongooseRepository.update(command);

    return configuration;
  },
  get: async (): Promise<IWebsiteConfiguration> => {
    return await websiteConfigurationMongooseRepository.get();
  },
});

export default createWebsiteConfigurationService;
