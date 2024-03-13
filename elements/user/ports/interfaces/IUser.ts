import { SuperRoleEnum } from "roottypes";

import IRole from "../../../role/ports/interfaces/IRole";
import IFile from "../../../file/ports/interfaces/IFile";
import IMessage from "../../../chat/message/ports/interfaces/IMessage";

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

export interface IUserWithLastReadMessageInConversation extends IUser {
  lastReadMessageInConversation: IMessage | null;
  to: string[];
}
