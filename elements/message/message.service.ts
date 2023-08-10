import mongoose from "mongoose";

import { IUser } from "../user/user.model";
import MessageGetBetweenUsersCommand from "./dtos/MessageGetBetweenUsersCommand";
import MessageGetLastConversations from "./dtos/MessageGetLastConversations";
import MessageSendCommand from "./dtos/MessageSendCommand";
import { IMessage } from "./message.model";
import messageRepository from "./message.repository";
import { socketEmit } from "../../socket";
import ChatMessagesEnum from "../../globalTypes/ChatMessagesEnum";
import { toReadDto } from "./dtos/MessageReadDto";

const messageService = {
  sendMessage: async (
    command: MessageSendCommand,
    currentUser: IUser
  ): Promise<IMessage> => {
    const message: IMessage = await messageRepository.sendMessage(
      command,
      currentUser
    );

    socketEmit({
      messageType: ChatMessagesEnum.Receive,
      object: toReadDto(message),
      userIds: message.to.map((userId) => userId.toString()),
    });

    return message;
  },
  getMessagesBetweenUsers: async (
    command: MessageGetBetweenUsersCommand,
    currentUser: IUser
  ): Promise<IMessage[]> => {
    const messages: IMessage[] =
      await messageRepository.getMessagesBetweenUsers(command);

    await messageService.markMessagesAsReadByUser({ messages, currentUser });

    return messages;
  },
  markMessagesAsReadByUser: async ({
    messagesIds,
    messages,
    currentUser,
  }: {
    messagesIds?: string[];
    messages?: IMessage[] | undefined;
    currentUser: IUser;
  }) => {
    if (messagesIds && messagesIds.length > 0) {
      const messages: IMessage[] = await messageRepository.getByIds(
        messagesIds
      );
      await messageRepository.markMessagesAsReadByUser(
        messages,
        currentUser._id
      );
    }
    if (messages && messages.length > 0) {
      await messageRepository.markMessagesAsReadByUser(
        messages,
        currentUser._id
      );
    }
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

    socketEmit({
      messageType: ChatMessagesEnum.Delete,
      object: toReadDto(message),
      userIds: message.to.map((userId) => userId.toString()),
    });
  },
  getLastConversationsLastMessages: async (
    command: MessageGetLastConversations,
    currentUser: IUser
  ): Promise<{ messages: IMessage[]; total: number }> => {
    return await messageRepository.getLastConversationsLastMessages(
      command,
      currentUser
    );
  },
  getUserTotalUnreadMessages: async (userId: string): Promise<number> => {
    return await messageRepository.getUserTotalUnreadMessages(userId);
  },
};

export default messageService;
