import { IReactionReadDto } from "roottypes";
import { userToReadDto } from "../../user/ports/user.toReadDto";
import IReaction from "./interfaces/IReaction";

export const reactionToReadDto = (
  reaction: IReaction | string
): IReactionReadDto | string => {
  if (typeof reaction === "string" || !reaction["_id"]) {
    return reaction.toString();
  }

  return {
    _id: reaction._id.toString(),
    user: userToReadDto(reaction.user),
    reaction: reaction.reaction,
    createdAt: reaction.createdAt,
    updatedAt: reaction.updatedAt,
  };
};
