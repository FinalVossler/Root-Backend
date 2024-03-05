import {
  IFileReadDto,
  IMessageReadDto,
  IPopulatedMessageReadDto,
  IReactionReadDto,
  IUserReadDto,
} from "roottypes";
import { fileToReadDto } from "../../file/ports/file.toReadDto";
import { reactionToReadDto } from "../../reaction/ports/reaction.toReadDto";
import { userToReadDto } from "../../user/ports/user.toReadDto";
import IMessage from "./interfaces/IMessage";
import IPopulatedMessage from "./interfaces/IPopulatedMessage";

export const populatedMessageToReadDto = (
  populatedMessage: IPopulatedMessage
): IPopulatedMessageReadDto => {
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
