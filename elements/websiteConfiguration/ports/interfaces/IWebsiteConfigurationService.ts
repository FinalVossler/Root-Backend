import { IWebsiteConfigurationUpdateCommand } from "roottypes";

import IWebsiteConfiguration from "./IWebsiteConfiguration";

interface IWebsiteConfigurationService {
  update: (
    command: IWebsiteConfigurationUpdateCommand
  ) => Promise<IWebsiteConfiguration>;
  get: () => Promise<IWebsiteConfiguration>;
}

export default IWebsiteConfigurationService;
