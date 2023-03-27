import { IUser } from "../user/user.model";
import WebsiteConfigurationUpdateCommand from "./dto/WebsiteConfigurationUpdateCommand";
import { IWebsiteConfiguration } from "./websiteConfiguration.model";
import websiteConfigurationRepository from "./websiteConfiguration.repository";

const websiteConfigurationService = {
  update: async (
    command: WebsiteConfigurationUpdateCommand,
    currentUser: IUser
  ): Promise<IWebsiteConfiguration> => {
    const configuration: IWebsiteConfiguration =
      await websiteConfigurationRepository.update(command, currentUser);

    return configuration;
  },
  get: async (): Promise<IWebsiteConfiguration> => {
    return await websiteConfigurationRepository.get();
  },
};

export default websiteConfigurationService;
