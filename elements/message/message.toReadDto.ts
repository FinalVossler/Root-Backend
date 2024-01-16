import {
  IFileReadDto,
  IMessageReadDto,
  IPopulatedMessageReadDto,
  IReactionReadDto,
  IUserReadDto,
} from "roottypes";
import { IMessage, IPopulatedMessage } from "./message.model";
import { fileToReadDto } from "../file/file.toReadDto";
import { reactionToReadDto } from "../reaction/reaction.toReadDto";
import { userToReadDto } from "../user/user.toReadDto";

export const populatedMessageToReadDto = (
  populatedMessage: IPopulatedMessage
): IPopulatedMessageReadDto => {
  console.log("populatedMessage", JSON.stringify(populatedMessage));
  return {
    _id: populatedMessage._id.toString(),
    from: userToReadDto(populatedMessage.from) as IUserReadDto,
    to: populatedMessage.to.map((to) => userToReadDto(to) as IUserReadDto),
    message: populatedMessage.message,
    read: populatedMessage.read.map((read) => read.toString()),
    readAt: populatedMessage.readAt,
    files: populatedMessage.files.map((f) => fileToReadDto(f) as IFileReadDto),
    reactions:
      populatedMessage.reactions?.map(
        (r) => reactionToReadDto(r) as IReactionReadDto
      ) || [],
    totalUnreadMessages: populatedMessage.totalUnreadMessages,
    createdAt: populatedMessage.createdAt,
    updatedAt: populatedMessage.updatedAt,
  };
};

export const messageToReadDto = (message: IMessage): IMessageReadDto => {
  return {
    _id: message._id.toString(),
    from: message.from.toString(),
    to: message.to.map((to) => to.toString()),
    message: message.message,
    read: message.read.map((read) => read.toString()),
    readAt: message.readAt,
    files: message.files.map((f) => fileToReadDto(f)),
    reactions: message.reactions?.map((r) => reactionToReadDto(r)) || [],
    totalUnreadMessages: message["totalUnreadMessages"],
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
};
