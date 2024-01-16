import express, { Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import protectMiddleware from "../../middleware/protectMiddleware";
import PaginationResponse from "../../globalTypes/PaginationResponse";
import { IPopulatedMessage } from "./message.model";
import messageService from "./message.service";
import { IUser } from "../user/user.model";
import {
  IMessageGetBetweenUsersCommand,
  IMessageGetLastConversations,
  IMessageMarkAllMessagesAsReadByUserCommand,
  IMessageSendCommand,
  IPopulatedMessageReadDto,
} from "roottypes";
import { populatedMessageToReadDto } from "./message.toReadDto";

const router = express.Router();

router.post(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, IMessageSendCommand, any>,
    res: Response<ResponseDto<IPopulatedMessageReadDto>>
  ) => {
    const command = req.body;
    const message: IPopulatedMessage = await messageService.sendMessage(
      command,
      req.user
    );

    return res.status(200).json({
      success: true,
      data: populatedMessageToReadDto(message),
    });
  }
);

router.post(
  "/get",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, IMessageGetBetweenUsersCommand, any>,
    res: Response<ResponseDto<PaginationResponse<IPopulatedMessageReadDto>>>
  ) => {
    const command = req.body;

    const currentUser: IUser = req.user;

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
      await messageService.getMessagesBetweenUsers(command);

    const total: number = await messageService.getTotalMessagesBetweenUsers(
      command
    );

    return res.status(200).json({
      success: true,
      data: {
        data: messages.map((message) => populatedMessageToReadDto(message)),
        total,
      },
    });
  }
);

router.post(
  "/conversationTotalUnreadMessages",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, string[], any>,
    res: Response<ResponseDto<number>>
  ) => {
    const usersIds: string[] = req.body;

    const totalUnreadMessages: number =
      await messageService.getTotalUnreadMessages(
        usersIds,
        req.user._id.toString()
      );

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
  "/markAllConversationMessagesAsReadByUser",
  protectMiddleware,
  async (
    req: ConnectedRequest<
      any,
      any,
      IMessageMarkAllMessagesAsReadByUserCommand,
      any
    >,
    res: Response<ResponseDto<number>>
  ) => {
    const to: string[] = req.body.to;
    const currentUser: IUser = req.user;

    await messageService.markAllConversationMessagesAsReadByUser({
      to,
      currentUser,
    });
    const userTotalUnreadMessages: number =
      await messageService.getUserTotalUnreadMessages(req.user?._id.toString());

    return res.status(200).json({
      success: true,
      data: userTotalUnreadMessages,
    });
  }
);

router.post(
  "/getLastConversationsLastMessages",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, IMessageGetLastConversations, any>,
    res: Response<ResponseDto<PaginationResponse<IPopulatedMessageReadDto>>>
  ) => {
    const { messages, total } =
      await messageService.getLastConversationsLastMessages(req.body, req.user);

    return res.status(200).json({
      success: true,
      data: {
        data: messages.map((m) => populatedMessageToReadDto(m)),
        total,
      },
    });
  }
);

router.post(
  "/userTotalUnreadMessages",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, any, any>,
    res: Response<ResponseDto<number>>
  ) => {
    const total: number = await messageService.getUserTotalUnreadMessages(
      req.user._id.toString()
    );

    return res.status(200).json({
      success: true,
      data: total,
    });
  }
);

export default router;
