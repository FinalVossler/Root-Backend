import mongoose from "mongoose";

import userModel from "../user/user.model";

export interface IMessage {
  _id: mongoose.ObjectId;
  from: mongoose.ObjectId;
  to: mongoose.ObjectId[];
  message: string;
  numberOfParticipants?: number;
}

interface MessageModel extends mongoose.Model<IMessage> {}

const MessageSchema = new mongoose.Schema<IMessage>(
  {
    message: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    from: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: userModel.name,
      required: true,
    },
    to: {
      type: [mongoose.SchemaTypes.ObjectId],
      ref: userModel.name,
      required: true,
    },
    numberOfParticipants: {
      type: mongoose.SchemaTypes.Number,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

MessageSchema.pre("save", function (next) {
  this.numberOfParticipants = this.to.length;

  next();
});

export default mongoose.model<IMessage, MessageModel>("message", MessageSchema);
