import { ReactionEnum } from "../reaction.model";

type ReactionCreateCommand = {
  messageId: string;
  reaction: ReactionEnum;
};

export default ReactionCreateCommand;
