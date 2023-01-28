import mongoose from "mongoose";
import { IUser } from "../user/user.model";
import MessageGetBetweenUsersCommand from "./dtos/MessageGetBetweenUsersCommand";
import MessageSendCommand from "./dtos/MessageSendCommand";
import { IMessage } from "./message.model";
import messageRespository from "./message.repository";

const messageService = {
  sendMessage: async (command: MessageSendCommand): Promise<IMessage> => {
    const message: IMessage = await messageRespository.sendMessage(command);

    return message;
  },
  getMessagesBetweenUsers: async (
    command: MessageGetBetweenUsersCommand,
    currentUser: IUser
  ): Promise<IMessage[]> => {
    const messages: IMessage[] =
      await messageRespository.getMessagesBetweenUsers(command);

    await messageRespository.markMessagesAsReadBy(messages, currentUser._id);

    return messages;
  },
  getTotalMessagesBetweenUsers: async (
    command: MessageGetBetweenUsersCommand
  ): Promise<number> => {
    const total: number = await messageRespository.getTotalMessages(command);

    return total;
  },
  getTotalUnreadMessages: async (
    usersIds: mongoose.ObjectId[],
    currentUserId: mongoose.ObjectId
  ): Promise<number> => {
    const total: number = await messageRespository.getTotalUnreadMessages(
      usersIds,
      currentUserId
    );

    return total;
  },
};

export default messageService;
