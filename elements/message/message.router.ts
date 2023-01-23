import express, { Request, Response } from "express";
import ResponseDto from "../../globalTypes/ResponseDto";
import protectMiddleware from "../../middleware/protectMiddleware";
import MessageGetBetweenUsersCommand from "./dtos/MessageGetBetweenUsersCommand";
import MessageReadDto, { toReadDto } from "./dtos/MessageReadDto";
import MessageSendCommand from "./dtos/MessageSendCommand";
import { IMessage } from "./message.model";
import messageService from "./message.service";

const router = express.Router();

router.post(
  "/",
  protectMiddleware,
  async (
    req: Request<any, any, MessageSendCommand>,
    res: Response<ResponseDto<MessageReadDto>>
  ) => {
    const command = req.body;
    const message: IMessage = await messageService.sendMessage(command);

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
    req: Request<any, any, MessageGetBetweenUsersCommand>,
    res: Response<ResponseDto<MessageReadDto[]>>
  ) => {
    const command = req.body;
    const messages: IMessage[] = await messageService.getMessagesBetweenUsers(
      command
    );

    return res.status(200).json({
      success: true,
      data: messages.map((message) => toReadDto(message)),
    });
  }
);

export default router;
