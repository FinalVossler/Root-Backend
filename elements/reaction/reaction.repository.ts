import { IUser } from "../user/user.model";
import ReactionCreateCommand from "./dtos/ReactionCreateCommand";
import Reaction, { IReaction } from "./reaction.model";
import Message from "../message/message.model";
import mongoose from "mongoose";

const reactionRepository = {
  create: async (
    command: ReactionCreateCommand,
    currentUser: IUser
  ): Promise<IReaction> => {
    const reaction = await Reaction.create({
      user: currentUser._id,
      reaction: command.reaction,
    });

    await Message.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(command.messageId) },
      {
        $addToSet: {
          reactions: new mongoose.Types.ObjectId(reaction._id.toString()),
        },
      }
    );

    return reaction.populate(populationOptions);
  },
};

const populationOptions = [
  {
    path: "user",
    model: "user",
  },
];

export default reactionRepository;
