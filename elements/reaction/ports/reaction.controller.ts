import { IReactionCreateCommand, IReactionReadDto } from "roottypes";

import { reactionToReadDto } from "./reaction.toReadDto";
import IReactionController from "./interfaces/IReactionController";
import IReactionService from "./interfaces/IReactionService";
import IRequest from "../../../globalTypes/IRequest";
import IUser from "../../user/ports/interfaces/IUser";
import IReaction from "./interfaces/IReaction";

const createReactionController = (
  reactionService: IReactionService
): IReactionController => ({
  createReaction: async (
    req: IRequest<IReactionCreateCommand>,
    currentUser: IUser
  ) => {
    const command = req.body;
    const reaction: IReaction = await reactionService.create(
      command,
      currentUser
    );

    return {
      success: true,
      data: reactionToReadDto(reaction) as IReactionReadDto,
    };
  },
});

export default createReactionController;
