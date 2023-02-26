import WebsiteConfigurationUpdateCommand from "./dto/WebsiteConfigurationUpdateCommand";
import { IWebsiteConfiguration } from "./websiteConfiguration.model";
import websiteConfigurationRepository from "./websiteConfiguration.repository";

const websiteConfigurationService = {
  update: async (
    command: WebsiteConfigurationUpdateCommand
  ): Promise<IWebsiteConfiguration> => {
    const configuration: IWebsiteConfiguration =
      await websiteConfigurationRepository.update(command);

    return configuration;
  },
};

export default websiteConfigurationService;
