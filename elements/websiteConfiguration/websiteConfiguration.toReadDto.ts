import { IWebsiteConfigurationReadDto } from "roottypes";
import { IWebsiteConfiguration } from "./websiteConfiguration.model";
import { fileToReadDto } from "../file/file.toReadDto";

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
  };
};
