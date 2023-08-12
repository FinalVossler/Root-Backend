import mongoose from "mongoose";

import { IMessage } from "../message/message.model";
import { IUser } from "../user/user.model";

export interface IReaction {
  _id: mongoose.ObjectId;
  message: IMessage;
  user: IUser;
  reaction: ReactionEnum;

  createdAt: string;
  updatedAt: string;
}

export enum ReactionEnum {
  Love = "Love",
  Laugh = "Laugh",
  Shock = "Shock",
  Cry = "Cry",
  Angry = "Angry",
}

interface ReactionModel extends mongoose.Model<IReaction> {}

const ReactionSchema = new mongoose.Schema<IReaction>(
  {
    message: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "message",
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "user",
    },
    reaction: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
  },
  {
    timestamps: true,
    virtuals: {},
  }
);

export default mongoose.model<IReaction, ReactionModel>(
  "reaction",
  ReactionSchema
);
