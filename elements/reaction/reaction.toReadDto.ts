import { IReactionReadDto } from "roottypes";
import { IReaction } from "./reaction.model";
import { userToReadDto } from "../user/user.toReadDto";
import mongoose from "mongoose";

export const reactionToReadDto = (
  reaction: IReaction | string
): IReactionReadDto | string => {
  if (
    typeof reaction === "string" ||
    mongoose.Types.ObjectId.isValid(reaction.toString())
  ) {
    return reaction.toString();
  }

  console.log("reaction", JSON.stringify(reaction));

  return {
    _id: reaction._id.toString(),
    user: userToReadDto(reaction.user),
    reaction: reaction.reaction,
    createdAt: reaction.createdAt,
    updatedAt: reaction.updatedAt,
  };
};
