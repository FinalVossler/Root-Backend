import { IWebsiteConfiguration } from "../websiteConfiguration.model";

type WebsiteConfigurationReadDto = {
  _id?: IWebsiteConfiguration["_id"];
  title: IWebsiteConfiguration["title"];
  tabTitle: IWebsiteConfiguration["tabTitle"];
  email: IWebsiteConfiguration["email"];
  phoneNumber: IWebsiteConfiguration["phoneNumber"];
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
  };
};

export default WebsiteConfigurationReadDto;
