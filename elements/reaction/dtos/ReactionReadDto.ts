import { IReaction } from "../reaction.model";

type ReactionReadDto = {
  _id: IReaction["_id"];
  user: IReaction["user"];
  reaction: IReaction["reaction"];
  createdAt: IReaction["createdAt"];
  updatedAt: IReaction["updatedAt"];
};

export const toReadDto = (reaction: IReaction): ReactionReadDto => {
  return {
    _id: reaction._id,
    user: reaction.user,
    reaction: reaction.reaction,
    createdAt: reaction.createdAt,
    updatedAt: reaction.updatedAt,
  };
};

export default ReactionReadDto;
