import express, { Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import protectMiddleware from "../../middleware/protectMiddleware";
import ReactionCreateCommand from "./dtos/ReactionCreateCommand";
import { IReaction } from "./reaction.model";
import ReactionReadDto, { toReadDto } from "./dtos/ReactionReadDto";
import reactionService from "./reaction.service";

const router = express.Router();

router.post(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, ReactionCreateCommand, any>,
    res: Response<ResponseDto<ReactionReadDto>>
  ) => {
    const command = req.body;
    const reaction: IReaction = await reactionService.create(command, req.user);

    return res.status(200).json({
      success: true,
      data: toReadDto(reaction),
    });
  }
);

export default router;
