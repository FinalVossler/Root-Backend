import { FileReadDto } from "../../file/dto/FileReadDto";
import { IWebsiteConfiguration, Theme } from "../websiteConfiguration.model";

type WebsiteConfigurationReadDto = {
  _id?: IWebsiteConfiguration["_id"];
  title: IWebsiteConfiguration["title"];
  description: IWebsiteConfiguration["description"];
  tabTitle: IWebsiteConfiguration["tabTitle"];
  email: IWebsiteConfiguration["email"];
  phoneNumber: IWebsiteConfiguration["phoneNumber"];
  mainLanguages: IWebsiteConfiguration["mainLanguages"];
  withChat: IWebsiteConfiguration["withChat"];
  withRegistration: IWebsiteConfiguration["withRegistration"];
  withTaskManagement: IWebsiteConfiguration["withTaskManagement"];
  theme: Theme;
  staticText: IWebsiteConfiguration["staticText"];
  tabIcon?: FileReadDto;
  logo1?: FileReadDto;
  logo2?: FileReadDto;
};

export const toReadDto = (
  websiteConfiguration: IWebsiteConfiguration
): WebsiteConfigurationReadDto => {
  return {
    _id: websiteConfiguration._id,
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
    tabIcon: websiteConfiguration.tabIcon,
    logo1: websiteConfiguration.logo1,
    logo2: websiteConfiguration.logo2,
  };
};

export default WebsiteConfigurationReadDto;
