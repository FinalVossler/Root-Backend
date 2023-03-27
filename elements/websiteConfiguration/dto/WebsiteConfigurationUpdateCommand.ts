import { IFile } from "../../file/file.model";
import { Theme } from "../websiteConfiguration.model";

type WebsiteConfigurationUpdateCommand = {
  title: string;
  email: string;
  phoneNumber: string;
  tabTitle: string;
  mainLanguages: string[];
  withChat: boolean;
  withRegistration: boolean;
  theme: Theme;
  tabIcon?: IFile;
};

export default WebsiteConfigurationUpdateCommand;
