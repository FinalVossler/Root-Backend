import http from "http";

import {
  ChatMessagesEnum,
  IMessageReadDto,
  INotificationReadDto,
  IPopulatedMessageReadDto,
  IReactionReadDto,
  ISocketTypingStateCommand,
  NotificationMessageEnum,
} from "roottypes";

import IUser from "../../../user/ports/interfaces/IUser";

interface ISocketService {
  socketInit: (server: http.Server) => void;
  socketEmit: ({
    userIds,
    messageType,
    object,
  }: {
    userIds: string[];
    messageType: ChatMessagesEnum | NotificationMessageEnum;
    object:
      | INotificationReadDto
      | IPopulatedMessageReadDto
      | ISocketTypingStateCommand
      | { reaction: IReactionReadDto; message: IMessageReadDto }
      | { lastMarkedMessageAsRead: IPopulatedMessageReadDto | null; by: IUser };
  }) => Promise<void>;
}

export default ISocketService;
