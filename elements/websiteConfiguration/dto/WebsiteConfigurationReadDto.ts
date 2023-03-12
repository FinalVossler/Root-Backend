import { IWebsiteConfiguration, Theme } from "../websiteConfiguration.model";

type WebsiteConfigurationReadDto = {
  _id?: IWebsiteConfiguration["_id"];
  title: IWebsiteConfiguration["title"];
  tabTitle: IWebsiteConfiguration["tabTitle"];
  email: IWebsiteConfiguration["email"];
  phoneNumber: IWebsiteConfiguration["phoneNumber"];
  mainLanguages: IWebsiteConfiguration["mainLanguages"];
  withChat: IWebsiteConfiguration["withChat"];
  withRegistration: IWebsiteConfiguration["withRegistration"];
  theme: Theme;
  staticText: IWebsiteConfiguration["staticText"];
};

export const toReadDto = (
  websiteConfiguration: IWebsiteConfiguration
): WebsiteConfigurationReadDto => {
  return {
    _id: websiteConfiguration._id,
    title: websiteConfiguration.title,
    tabTitle: websiteConfiguration.tabTitle,
    email: websiteConfiguration.email,
    phoneNumber: websiteConfiguration.phoneNumber,
    mainLanguages: websiteConfiguration.mainLanguages,
    withChat: websiteConfiguration.withChat,
    withRegistration: websiteConfiguration.withRegistration,
    theme: websiteConfiguration.theme,
    staticText: websiteConfiguration.staticText,
  };
};

export default WebsiteConfigurationReadDto;
