import mongoose from "mongoose";
import IReaction from "../ports/interfaces/IReaction";

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
