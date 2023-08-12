import { IUser } from "../user/user.model";
import ReactionCreateCommand from "./dtos/ReactionCreateCommand";
import Reaction, { IReaction } from "./reaction.model";

const reactionRepository = {
  create: async (
    command: ReactionCreateCommand,
    currentUser: IUser
  ): Promise<IReaction> => {
    const reaction = await Reaction.create({
      message: command.messageId,
      user: currentUser._id,
      reaction: command.reaction,
    });

    return reaction.populate(populationOptions);
  },
};

const populationOptions = [
  {
    path: "user",
    model: "user",
  },
  {
    path: "message",
    model: "message",
  },
];

export default reactionRepository;
