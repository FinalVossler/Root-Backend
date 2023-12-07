import mongoose from "mongoose";

import { IUser } from "../user/user.model";

export interface IReaction {
  _id: mongoose.Types.ObjectId;
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
  OK = "OK",
}

interface ReactionModel extends mongoose.Model<IReaction> {}

const ReactionSchema = new mongoose.Schema<IReaction>(
  {
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

const Reaction = mongoose.model<IReaction, ReactionModel>(
  "reaction",
  ReactionSchema
);

export default Reaction;
