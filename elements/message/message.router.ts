import express, { Response } from "express";
import mongoose from "mongoose";
import ConnectedRequest from "../../globalTypes/ConnectedRequest";

import ResponseDto from "../../globalTypes/ResponseDto";
import protectMiddleware from "../../middleware/protectMiddleware";
import MessageGetBetweenUsersCommand from "./dtos/MessageGetBetweenUsersCommand";
import MessageReadDto, { toReadDto } from "./dtos/MessageReadDto";
import MessageSendCommand from "./dtos/MessageSendCommand";
import PaginationResponse from "../../globalTypes/PaginationResponse";
import { IMessage } from "./message.model";
import messageService from "./message.service";
import { IUser } from "../user/user.model";
import MessageGetLastConversations from "./dtos/MessageGetLastConversations";

const router = express.Router();

router.post(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, MessageSendCommand, any>,
    res: Response<ResponseDto<MessageReadDto>>
  ) => {
    const command = req.body;
    const message: IMessage = await messageService.sendMessage(
      command,
      req.user
    );

    return res.status(200).json({
      success: true,
      data: toReadDto(message),
    });
  }
);

router.post(
  "/get",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, MessageGetBetweenUsersCommand, any>,
    res: Response<ResponseDto<PaginationResponse<MessageReadDto>>>
  ) => {
    const command = req.body;

    const messages: IMessage[] = await messageService.getMessagesBetweenUsers(
      command,
      req.user
    );

    const total: number = await messageService.getTotalMessagesBetweenUsers(
      command
    );

    return res.status(200).json({
      success: true,
      data: {
        data: messages.map((message) => toReadDto(message)),
        total,
      },
    });
  }
);

router.post(
  "/totalUnreadMessages",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, mongoose.ObjectId[], any>,
    res: Response<ResponseDto<number>>
  ) => {
    const usersIds: mongoose.ObjectId[] = req.body;

    const totalUnreadMessages: number =
      await messageService.getTotalUnreadMessages(usersIds, req.user._id);

    return res.status(200).json({
      success: true,
      data: totalUnreadMessages,
    });
  }
);

router.delete(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, any, { messageId: string }>,
    res: Response<ResponseDto<void>>
  ) => {
    const messageId: string = req.query.messageId;

    await messageService.deleteMessage(messageId, req.user);

    return res.status(200).json({
      success: true,
      data: null,
    });
  }
);

router.post(
  "/markMessagesAsRead",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, { messagesIds: string[] }, any>,
    res: Response<ResponseDto<void>>
  ) => {
    const messagesIds: string[] = req.body.messagesIds;
    const currentUser: IUser = req.user;

    await messageService.markMessagesAsReadByUser({ messagesIds, currentUser });

    return res.status(200).json({
      success: true,
      data: null,
    });
  }
);

router.post(
  "/getLastConversationsLastMessages",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, MessageGetLastConversations, any>,
    res: Response<ResponseDto<PaginationResponse<MessageReadDto>>>
  ) => {
    const { messages, total } =
      await messageService.getLastConversationsLastMessages(req.body, req.user);

    return res.status(200).json({
      success: true,
      data: {
        data: messages.map((m) => toReadDto(m)),
        total,
      },
    });
  }
);

export default router;
