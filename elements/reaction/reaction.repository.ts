import { IUser } from "../user/user.model";
import Reaction, { IReaction } from "./reaction.model";
import Message, { IMessage } from "../message/message.model";
import mongoose from "mongoose";
import { IReactionCreateCommand } from "roottypes";

const reactionRepository = {
  create: async (
    command: IReactionCreateCommand,
    currentUser: IUser
  ): Promise<IReaction> => {
    // check if the reaction already exists:
    const message: IMessage | null = await Message.findOne({
      _id: new mongoose.Types.ObjectId(command.messageId),
    })
      .populate([
        {
          path: "reactions",
          model: "reaction",
          populate: {
            path: "user",
            model: "user",
          },
        },
      ])
      .exec();

    let existingReaction: IReaction | undefined | null = (
      message?.reactions as IReaction[]
    )?.find(
      (reaction) =>
        (reaction.user as IUser)._id.toString() === currentUser._id.toString()
    );
    if (existingReaction) {
      existingReaction = await Reaction.findOneAndUpdate(
        { _id: existingReaction._id },
        { $set: { reaction: command.reaction } }
      ).populate(populationOptions);

      return existingReaction as IReaction;
    }

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
        read: [new mongoose.Types.ObjectId(currentUser._id.toString())],
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
