import messageService from "./message.service";
import {
  IMessageGetBetweenUsersCommand,
  IMessageGetLastConversations,
  IMessageMarkAllMessagesAsReadByUserCommand,
  IMessageSendCommand,
} from "roottypes";
import { populatedMessageToReadDto } from "./message.toReadDto";
import IPopulatedMessage from "./interfaces/IPopulatedMessage";
import IUser from "../../user/ports/interfaces/IUser";
import IMessageController from "./interfaces/IMessageController";
import IRequest from "../../../globalTypes/IRequest";
import IMessageService from "./interfaces/IMessageService";

const createMessageController = (
  messageService: IMessageService
): IMessageController => ({
  createMessage: async (
    req: IRequest<IMessageSendCommand>,
    currentUser: IUser
  ) => {
    const message: IPopulatedMessage = await messageService.sendMessage(
      req.body,
      currentUser
    );

    return {
      success: true,
      data: populatedMessageToReadDto(message),
    };
  },
  getMessage: async (
    req: IRequest<IMessageGetBetweenUsersCommand>,
    currentUser: IUser
  ) => {
    if (
      !req.body.usersIds.find(
        (userId) => userId.toString() === currentUser._id.toString()
      )
    ) {
      throw new Error(
        "you are trying to get messages in a conversation you don't belong to"
      );
    }

    const messages: IPopulatedMessage[] =
      await messageService.getMessagesBetweenUsers(req.body);

    const total: number = await messageService.getTotalMessagesBetweenUsers(
      req.body
    );

    return {
      success: true,
      data: {
        data: messages.map((message) => populatedMessageToReadDto(message)),
        total,
      },
    };
  },
  getConversationTotalUnreadMessages: async (
    req: IRequest<string[]>,
    currentUser: IUser
  ) => {
    const totalUnreadMessages: number =
      await messageService.getTotalUnreadMessages(
        req.body,
        currentUser._id.toString()
      );

    return {
      success: true,
      data: totalUnreadMessages,
    };
  },
  deleteMessage: async (
    req: IRequest<any, any, { messageId: string }>,
    currentUser: IUser
  ) => {
    const messageId: string = req.query.messageId;

    await messageService.deleteMessage(messageId, currentUser);

    return {
      success: true,
      data: null,
    };
  },
  markAllConversationMessagesAsReadByUser: async (
    req: IRequest<IMessageMarkAllMessagesAsReadByUserCommand>,
    currentUser: IUser
  ) => {
    await messageService.markAllConversationMessagesAsReadByUser({
      to: req.body.to,
      currentUser,
    });
    const userTotalUnreadMessages: number =
      await messageService.getUserTotalUnreadMessages(
        currentUser?._id.toString()
      );

    return {
      success: true,
      data: userTotalUnreadMessages,
    };
  },
  getLastConversationsLastMessages: async (
    req: IRequest<IMessageGetLastConversations>,
    currentUser: IUser
  ) => {
    const { messages, total } =
      await messageService.getLastConversationsLastMessages(
        req.body,
        currentUser
      );

    return {
      success: true,
      data: {
        data: messages.map((m) => populatedMessageToReadDto(m)),
        total,
      },
    };
  },
  getUserTotalUnreadMessages: async (req: IRequest, currentUser: IUser) => {
    const total: number = await messageService.getUserTotalUnreadMessages(
      currentUser._id.toString()
    );

    return {
      success: true,
      data: total,
    };
  },
});

export default createMessageController;
