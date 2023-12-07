import mongoose from "mongoose";
import RoleReadDto, {
  toReadDto as roleReadDto,
} from "../../role/dto/RoleReadDto";

import { IUser, UserWithLastReadMessageInConversation } from "../user.model";
import MessageReadDto from "../../message/dtos/MessageReadDto";

type UserReadDto = {
  _id: mongoose.Types.ObjectId;
  firstName: IUser["firstName"];
  lastName: IUser["lastName"];
  email: IUser["email"];
  profilePicture?: IUser["profilePicture"];
  superRole: IUser["superRole"];
  role?: RoleReadDto;
  hasMessagingEmailsActivated?: boolean;
};

export type UserReadDtoWithLastReadMessageInConversation = UserReadDto & {
  to: string[];
  lastReadMessageInConversation: MessageReadDto | null;
};

export const toReadDto = (user: IUser): UserReadDto => {
  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    profilePicture: user.profilePicture,
    superRole: user.superRole,
    role: user.role ? roleReadDto(user.role) : undefined,
    hasMessagingEmailsActivated: user.hasMessagingEmailsActivated,
  };
};

export const toReadDtoWithLastReadMessageInConversation = (
  user: UserWithLastReadMessageInConversation
): UserReadDtoWithLastReadMessageInConversation => {
  return {
    ...toReadDto(user),
    to: user.to,
    lastReadMessageInConversation: user.lastReadMessageInConversation,
  };
};

export default UserReadDto;
