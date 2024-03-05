import { SuperRoleEnum } from "roottypes";
import IRole from "../../../role/ports/interfaces/IRole";
import { IFile } from "../../../file/file.model";

export default interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  superRole: SuperRoleEnum;
  profilePicture?: IFile | string;
  passwordChangeToken: string;
  role?: IRole | string;
  hasMessagingEmailsActivated?: boolean;
}
