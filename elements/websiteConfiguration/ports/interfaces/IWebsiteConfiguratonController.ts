import {
  IWebsiteConfigurationReadDto,
  IWebsiteConfigurationUpdateCommand,
} from "roottypes";

import IRequest from "../../../../globalTypes/IRequest";
import IResponseDto from "../../../../globalTypes/IResponseDto";

type IWebsiteConfigurationController = {
  updateWebsiteConfiguration: (
    req: IRequest<IWebsiteConfigurationUpdateCommand>
  ) => Promise<IResponseDto<IWebsiteConfigurationReadDto>>;
  getWebsiteConfiguration: (
    req: IRequest
  ) => Promise<IResponseDto<IWebsiteConfigurationReadDto>>;
};

export default IWebsiteConfigurationController;
