import { ITheme, ITranslatedText } from "roottypes";

import IFile from "../../../file/ports/interfaces/IFile";

export default interface IWebsiteConfiguration {
  _id?: string;
  title?: string;
  description?: ITranslatedText[];
  email?: string;
  phoneNumber?: string;
  tabTitle?: string;
  mainLanguages: string[];
  withChat?: boolean;
  withRegistration?: boolean;
  withTaskManagement?: boolean;
  withEcommerce?: boolean;
  theme: ITheme;
  tabIcon?: IFile | string;
  logo1?: IFile | string;
  logo2?: IFile | string;

  staticText?: any;
}
