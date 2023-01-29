import mongoose from "mongoose";

import File, { IFile } from "../file/file.model";
import User from "../user/user.model";

export interface IMessage {
  _id: mongoose.ObjectId;
  from: mongoose.ObjectId;
  to: mongoose.ObjectId[];
  message: string;
  numberOfParticipants?: number;
  read: mongoose.ObjectId[];
  files: IFile[];

  createdAt: string;
  updatedAt: string;
}

interface MessageModel extends mongoose.Model<IMessage> {}

const MessageSchema = new mongoose.Schema<IMessage>(
  {
    message: {
      type: mongoose.SchemaTypes.String,
      required: false,
    },
    from: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: User.name,
      required: true,
    },
    to: {
      type: [mongoose.SchemaTypes.ObjectId],
      ref: User.modelName,
      required: true,
    },
    numberOfParticipants: {
      type: mongoose.SchemaTypes.Number,
      required: false,
    },
    read: {
      type: [
        {
          type: mongoose.SchemaTypes.ObjectId,
          ref: User.modelName,
        },
      ],
      required: false,
    },
    files: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        required: false,
        ref: File.modelName,
        default: [],
      },
    ],
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
