import {
  IUserReadDto,
  IUserReadDtoWithLastReadMessageInConversationReadDto,
} from "roottypes";

import { fileToReadDto } from "../../file/ports/file.toReadDto";
import { roleToReadDto } from "../../role/ports/role.toReadDto";
import { messageToReadDto } from "../../chat/message/ports/message.toReadDto";
import IUser, {
  IUserWithLastReadMessageInConversation,
} from "./interfaces/IUser";

export const userToReadDto = (
  user: IUser | string | undefined
): IUserReadDto | string => {
  if (
    !user ||
    typeof user === "string" ||
    Object.keys(user || {}).length === 0
  ) {
    return user?.toString() || "";
  }

  return {
    _id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    profilePicture: user.profilePicture
      ? fileToReadDto(user.profilePicture)
      : undefined,
    superRole: user.superRole,
    role: user.role ? roleToReadDto(user.role) : undefined,
    hasMessagingEmailsActivated: user.hasMessagingEmailsActivated,
  };
};

export const userToReadDtoWithLastReadMessageInConversation = (
  user: IUserWithLastReadMessageInConversation
): IUserReadDtoWithLastReadMessageInConversationReadDto => {
  return {
    _id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    superRole: user.superRole,
    hasMessagingEmailsActivated: user.hasMessagingEmailsActivated,
    profilePicture: user.profilePicture
      ? fileToReadDto(user.profilePicture)
      : undefined,
    role: user.role ? roleToReadDto(user.role) : undefined,
    to: user.to,
    lastReadMessageInConversation: user.lastReadMessageInConversation
      ? messageToReadDto(user.lastReadMessageInConversation)
      : null,
  };
};
