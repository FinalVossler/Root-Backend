import mongoose from "mongoose";
import { IUser } from "../user/user.model";
import MessageGetBetweenUsersCommand from "./dtos/MessageGetBetweenUsersCommand";
import MessageSendCommand from "./dtos/MessageSendCommand";
import { IMessage } from "./message.model";
import messageRepository from "./message.repository";

const messageService = {
  sendMessage: async (
    command: MessageSendCommand,
    currentUser: IUser
  ): Promise<IMessage> => {
    const message: IMessage = await messageRepository.sendMessage(
      command,
      currentUser
    );

    return message;
  },
  getMessagesBetweenUsers: async (
    command: MessageGetBetweenUsersCommand,
    currentUser: IUser
  ): Promise<IMessage[]> => {
    const messages: IMessage[] =
      await messageRepository.getMessagesBetweenUsers(command);

    await messageRepository.markMessagesAsReadBy(messages, currentUser._id);

    return messages;
  },
  getTotalMessagesBetweenUsers: async (
    command: MessageGetBetweenUsersCommand
  ): Promise<number> => {
    const total: number = await messageRepository.getTotalMessages(command);

    return total;
  },
  getTotalUnreadMessages: async (
    usersIds: mongoose.ObjectId[],
    currentUserId: mongoose.ObjectId
  ): Promise<number> => {
    const total: number = await messageRepository.getTotalUnreadMessages(
      usersIds,
      currentUserId
    );

    return total;
  },
  deleteMessage: async (messageId: string, currentUser: IUser) => {
    const message: IMessage = await messageRepository.getMessage(messageId);

    if (!message) {
      throw new Error("Message already deleted");
    }

    if (message.from.toString() !== currentUser._id.toString()) {
      throw new Error("unauthenticated");
    }

    await messageRepository.deleteMessage(messageId);
  },
};

export default messageService;
