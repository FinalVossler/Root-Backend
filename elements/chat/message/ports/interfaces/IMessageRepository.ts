import {
  IMessageGetBetweenUsersCommand,
  IMessageGetLastConversations,
  IMessageSendCommand,
} from "roottypes";

import IUser from "../../../../user/ports/interfaces/IUser";
import IPopulatedMessage from "./IPopulatedMessage";
import IMessage from "./IMessage";

interface IMessageRepository {
  sendMessage: (
    command: IMessageSendCommand,
    currentUser: IUser
  ) => Promise<IPopulatedMessage>;
  getMessagesBetweenUsers: (
    command: IMessageGetBetweenUsersCommand
  ) => Promise<IPopulatedMessage[]>;
  getByIds: (messagesIds: string[]) => Promise<IPopulatedMessage[]>;
  markAllConversationMessagesAsReadByUser: (
    to: string[],
    userId: string
  ) => Promise<IPopulatedMessage | null>;
  getTotalMessages: (
    command: IMessageGetBetweenUsersCommand
  ) => Promise<number>;
  getTotalUnreadMessages: (
    usersIds: string[],
    currentUserId: string
  ) => Promise<number>;
  deleteMessage: (messageId: string) => Promise<void>;
  getMessage: (messageId: string) => Promise<IPopulatedMessage>;
  getLastConversationsLastMessages: (
    command: IMessageGetLastConversations,
    currentUser: IUser
  ) => Promise<{ messages: IPopulatedMessage[]; total: number }>;
  getUserTotalUnreadMessages: (userId: string) => Promise<number>;
  getById: (messageId: string) => Promise<IMessage>;
  getUserLastReadMessageInConversation: ({
    to,
    userId,
  }: {
    to: string[];
    userId: string;
  }) => Promise<IMessage | null>;
}

export default IMessageRepository;
