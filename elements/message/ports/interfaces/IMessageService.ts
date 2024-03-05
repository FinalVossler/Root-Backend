import {
  IMessageGetBetweenUsersCommand,
  IMessageGetLastConversations,
  IMessageSendCommand,
} from "roottypes";
import IUser from "../../../user/ports/interfaces/IUser";
import IPopulatedMessage from "./IPopulatedMessage";
import IMessage from "./IMessage";

interface IMessageService {
  sendMessage: (
    command: IMessageSendCommand,
    currentUser: IUser
  ) => Promise<IPopulatedMessage>;
  getMessagesBetweenUsers: (
    command: IMessageGetBetweenUsersCommand
  ) => Promise<IPopulatedMessage[]>;
  markAllConversationMessagesAsReadByUser: ({
    to,
    currentUser,
  }: {
    to: string[];
    currentUser: IUser;
  }) => Promise<IPopulatedMessage | null>;
  getTotalMessagesBetweenUsers: (
    command: IMessageGetBetweenUsersCommand
  ) => Promise<number>;
  getTotalUnreadMessages: (
    usersIds: string[],
    currentUserId: string
  ) => Promise<number>;
  deleteMessage: (messageId: string, currentUser: IUser) => Promise<void>;
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

export default IMessageService;
