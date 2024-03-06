import { IWebsiteConfigurationUpdateCommand } from "roottypes";

import IWebsiteConfiguration from "./IWebsiteConfiguration";

interface IWebsiteConfigurationRepository {
  get: () => Promise<IWebsiteConfiguration>;
  update: (
    command: IWebsiteConfigurationUpdateCommand
  ) => Promise<IWebsiteConfiguration>;
  create: () => Promise<IWebsiteConfiguration>;
}

export default IWebsiteConfigurationRepository;
