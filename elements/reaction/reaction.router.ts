import express, { Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import protectMiddleware from "../../middleware/protectMiddleware";
import { IReaction } from "./reaction.model";
import reactionService from "./reaction.service";
import { IReactionCreateCommand, IReactionReadDto } from "roottypes";
import { reactionToReadDto } from "./reaction.toReadDto";

const router = express.Router();

router.post(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, IReactionCreateCommand, any>,
    res: Response<ResponseDto<IReactionReadDto>>
  ) => {
    const command = req.body;
    const reaction: IReaction = await reactionService.create(command, req.user);

    return res.status(200).json({
      success: true,
      data: reactionToReadDto(reaction) as IReactionReadDto,
    });
  }
);

export default router;
