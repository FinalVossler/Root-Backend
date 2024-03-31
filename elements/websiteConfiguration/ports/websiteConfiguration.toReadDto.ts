import { IWebsiteConfigurationReadDto } from "roottypes";

import { fileToReadDto } from "../../file/ports/file.toReadDto";
import IWebsiteConfiguration from "./interfaces/IWebsiteConfiguration";
import { roleToReadDto } from "../../role/ports/role.toReadDto";

export const websiteConfigurationToReadDto = (
  websiteConfiguration: IWebsiteConfiguration
): IWebsiteConfigurationReadDto => {
  return {
    _id: websiteConfiguration._id?.toString(),
    title: websiteConfiguration.title,
    description: websiteConfiguration.description,
    tabTitle: websiteConfiguration.tabTitle,
    email: websiteConfiguration.email,
    phoneNumber: websiteConfiguration.phoneNumber,
    mainLanguages: websiteConfiguration.mainLanguages,
    withChat: websiteConfiguration.withChat,
    withRegistration: websiteConfiguration.withRegistration,
    withTaskManagement: websiteConfiguration.withTaskManagement,
    withEcommerce: websiteConfiguration.withEcommerce,
    theme: websiteConfiguration.theme,
    staticText: websiteConfiguration.staticText,
    tabIcon: websiteConfiguration.tabIcon
      ? fileToReadDto(websiteConfiguration.tabIcon)
      : undefined,
    logo1: websiteConfiguration.logo1
      ? fileToReadDto(websiteConfiguration.logo1)
      : undefined,
    logo2: websiteConfiguration.logo2
      ? fileToReadDto(websiteConfiguration.logo2)
      : undefined,
    automaticallyAssignedRoleAtRegistration:
      websiteConfiguration.automaticallyAssignedRoleAtRegistration
        ? roleToReadDto(
            websiteConfiguration.automaticallyAssignedRoleAtRegistration
          )
        : undefined,
  };
};
