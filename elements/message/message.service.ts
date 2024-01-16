import { IUser } from "../user/user.model";
import { IMessage, IPopulatedMessage } from "./message.model";
import messageRepository from "./message.repository";
import { socketEmit } from "../../socket";
import { populatedMessageToReadDto } from "./messageToReadDto";
import {
  ChatMessagesEnum,
  IMessageGetBetweenUsersCommand,
  IMessageGetLastConversations,
  IMessageSendCommand,
} from "roottypes";

const messageService = {
  sendMessage: async (
    command: IMessageSendCommand,
    currentUser: IUser
  ): Promise<IPopulatedMessage> => {
    const populatedMessage: IPopulatedMessage =
      await messageRepository.sendMessage(command, currentUser);

    socketEmit({
      messageType: ChatMessagesEnum.Receive,
      object: populatedMessageToReadDto(populatedMessage),
      userIds: populatedMessage.to.map((user) => user._id.toString()),
    });

    socketEmit({
      messageType: ChatMessagesEnum.ReceiveLastMarkedMessageAsReadByUser,
      object: {
        lastMarkedMessageAsRead: populatedMessageToReadDto(populatedMessage),
        by: currentUser,
      },
      userIds: populatedMessage.to.map((user) => user._id.toString()),
    });

    return populatedMessage;
  },
  getMessagesBetweenUsers: async (
    command: IMessageGetBetweenUsersCommand
  ): Promise<IPopulatedMessage[]> => {
    const messages: IPopulatedMessage[] =
      await messageRepository.getMessagesBetweenUsers(command);

    return messages;
  },
  markAllConversationMessagesAsReadByUser: async ({
    to,
    currentUser,
  }: {
    to: string[];
    currentUser: IUser;
  }): Promise<IPopulatedMessage | null> => {
    const lastMarkedMessageAsRead: IPopulatedMessage | null =
      await messageRepository.markAllConversationMessagesAsReadByUser(
        to,
        currentUser._id
      );

    if (lastMarkedMessageAsRead) {
      socketEmit({
        messageType: ChatMessagesEnum.ReceiveLastMarkedMessageAsReadByUser,
        object: {
          lastMarkedMessageAsRead: lastMarkedMessageAsRead
            ? populatedMessageToReadDto(lastMarkedMessageAsRead)
            : null,
          by: currentUser,
        },
        userIds: to,
      });
    }

    return lastMarkedMessageAsRead;
  },
  getTotalMessagesBetweenUsers: async (
    command: IMessageGetBetweenUsersCommand
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
    const message: IPopulatedMessage = await messageRepository.getMessage(
      messageId
    );

    if (!message) {
      throw new Error("Message already deleted");
    }

    if (message.from._id.toString() !== currentUser._id.toString()) {
      throw new Error("unauthenticated");
    }

    await messageRepository.deleteMessage(messageId);

    socketEmit({
      messageType: ChatMessagesEnum.Delete,
      object: populatedMessageToReadDto(message),
      userIds: message.to.map((userId) => userId.toString()),
    });
  },
  getLastConversationsLastMessages: async (
    command: IMessageGetLastConversations,
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
