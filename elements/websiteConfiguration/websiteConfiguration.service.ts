import { IWebsiteConfigurationUpdateCommand } from "roottypes";
import { IUser } from "../user/adapters/user.mongoose.model";
import { IWebsiteConfiguration } from "./websiteConfiguration.model";
import websiteConfigurationRepository from "./websiteConfiguration.repository";

const websiteConfigurationService = {
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
};

export default websiteConfigurationService;
