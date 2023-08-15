import mongoose from "mongoose";

import { IUser } from "../user/user.model";
import MessageGetBetweenUsersCommand from "./dtos/MessageGetBetweenUsersCommand";
import MessageGetLastConversations from "./dtos/MessageGetLastConversations";
import MessageSendCommand from "./dtos/MessageSendCommand";
import { IMessage, IPopulatedMessage } from "./message.model";
import messageRepository from "./message.repository";
import { socketEmit } from "../../socket";
import ChatMessagesEnum from "../../globalTypes/ChatMessagesEnum";
import { toReadDto } from "./dtos/MessageReadDto";

const messageService = {
  sendMessage: async (
    command: MessageSendCommand,
    currentUser: IUser
  ): Promise<IPopulatedMessage> => {
    const populatedMessage: IPopulatedMessage =
      await messageRepository.sendMessage(command, currentUser);

    socketEmit({
      messageType: ChatMessagesEnum.Receive,
      object: toReadDto(populatedMessage),
      userIds: populatedMessage.to.map((user) => user._id.toString()),
    });

    socketEmit({
      messageType: ChatMessagesEnum.ReceiveLastMarkedMessageAsReadByUser,
      object: {
        lastMarkedMessageAsRead: toReadDto(populatedMessage),
        by: currentUser,
      },
      userIds: populatedMessage.to.map((user) => user._id.toString()),
    });

    return populatedMessage;
  },
  getMessagesBetweenUsers: async (
    command: MessageGetBetweenUsersCommand
  ): Promise<IMessage[]> => {
    const messages: IMessage[] =
      await messageRepository.getMessagesBetweenUsers(command);

    return messages;
  },
  markAllConversationMessagesAsReadByUser: async ({
    to,
    currentUser,
  }: {
    to: string[];
    currentUser: IUser;
  }): Promise<IMessage | null> => {
    const lastMarkedMessageAsRead: IMessage =
      await messageRepository.markAllConversationMessagesAsReadByUser(
        to,
        currentUser._id
      );

    socketEmit({
      messageType: ChatMessagesEnum.ReceiveLastMarkedMessageAsReadByUser,
      object: {
        lastMarkedMessageAsRead: toReadDto(lastMarkedMessageAsRead),
        by: currentUser,
      },
      userIds: to,
    });

    return lastMarkedMessageAsRead;
  },
  getTotalMessagesBetweenUsers: async (
    command: MessageGetBetweenUsersCommand
  ): Promise<number> => {
    const total: number = await messageRepository.getTotalMessages(command);

    return total;
  },
  getTotalUnreadMessages: async (
    usersIds: string[],
    currentUserId: string
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
  ): Promise<{ messages: IPopulatedMessage[]; total: number }> => {
    return await messageRepository.getLastConversationsLastMessages(
      command,
      currentUser
    );
  },
  getUserTotalUnreadMessages: async (userId: string): Promise<number> => {
    return await messageRepository.getUserTotalUnreadMessages(userId);
  },
  getById: async (messageId: string): Promise<IMessage> => {
    const message: IMessage = await messageRepository.getById(messageId);

    return message;
  },
  getUserLastReadMessageInConversation: async ({
    to,
    userId,
  }: {
    to: string[];
    userId: string;
  }): Promise<IMessage | null> => {
    return await messageRepository.getUserLastReadMessageInConversation({
      to,
      userId,
    });
  },
};

export default messageService;
