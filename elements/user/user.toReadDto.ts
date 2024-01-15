import {
  IUserReadDto,
  IUserReadDtoWithLastReadMessageInConversationReadDto,
} from "roottypes";
import { IUser, IUserWithLastReadMessageInConversation } from "./user.model";
import { fileToReadDto } from "../file/file.toReadDto";
import { roleToReadDto } from "../role/role.toReadDto";
import { messageToReadDto } from "../message/messageToReadDto";
import mongoose from "mongoose";

export const userToReadDto = (user: IUser | string): IUserReadDto | string => {
  if (
    typeof user === "string" ||
    mongoose.Types.ObjectId.isValid(user.toString())
  ) {
    return user.toString();
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
