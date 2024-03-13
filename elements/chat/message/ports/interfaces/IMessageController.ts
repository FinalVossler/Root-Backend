import {
  IMessageGetBetweenUsersCommand,
  IMessageGetLastConversations,
  IMessageMarkAllMessagesAsReadByUserCommand,
  IMessageSendCommand,
  IPopulatedMessageReadDto,
} from "roottypes";

import IRequest from "../../../../../globalTypes/IRequest";
import IResponseDto from "../../../../../globalTypes/IResponseDto";
import IPaginationResponse from "../../../../../globalTypes/IPaginationResponse";
import IUser from "../../../../user/ports/interfaces/IUser";

type IMessageController = {
  createMessage: (
    req: IRequest<IMessageSendCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IPopulatedMessageReadDto>>;
  getMessage: (
    req: IRequest<IMessageGetBetweenUsersCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IPaginationResponse<IPopulatedMessageReadDto>>>;
  getConversationTotalUnreadMessages: (
    req: IRequest<string[]>,
    currentUser: IUser
  ) => Promise<IResponseDto<number>>;
  deleteMessage: (
    req: IRequest<any, any, { messageId: string }>,
    currentUser: IUser
  ) => Promise<IResponseDto<void>>;
  markAllConversationMessagesAsReadByUser: (
    req: IRequest<IMessageMarkAllMessagesAsReadByUserCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<number>>;
  getLastConversationsLastMessages: (
    req: IRequest<IMessageGetLastConversations>,
    user: IUser
  ) => Promise<IResponseDto<IPaginationResponse<IPopulatedMessageReadDto>>>;
  getUserTotalUnreadMessages: (
    req: IRequest,
    currentUser: IUser
  ) => Promise<IResponseDto<number>>;
};

export default IMessageController;
