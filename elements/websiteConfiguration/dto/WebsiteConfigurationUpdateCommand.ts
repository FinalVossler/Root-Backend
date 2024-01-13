import { IFile } from "../../file/file.model";
import { ITheme } from "../websiteConfiguration.model";

type WebsiteConfigurationUpdateCommand = {
  title: string;
  description: string;
  email: string;
  phoneNumber: string;
  tabTitle: string;
  mainLanguages: string[];
  withChat: boolean;
  withRegistration: boolean;
  withTaskManagement: boolean;
  theme: ITheme;
  tabIcon?: IFile;
  logo1?: IFile;
  logo2?: IFile;
  language: string;
};

export default WebsiteConfigurationUpdateCommand;
