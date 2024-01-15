import mongoose from "mongoose";

import { IFile } from "../file/file.model";
import { IUser } from "../user/user.model";
import Reaction, { IReaction } from "../reaction/reaction.model";

export interface IMessage {
  _id: mongoose.Types.ObjectId;
  from: mongoose.Types.ObjectId;
  to: mongoose.Types.ObjectId[];
  message: string;
  numberOfParticipants?: number;
  read: mongoose.Types.ObjectId[];
  readAt?: string[];
  files: (IFile | string)[];
  reactions?: (IReaction | string)[];

  createdAt: string;
  updatedAt: string;
}

export interface IPopulatedMessage {
  _id: mongoose.Types.ObjectId;
  from: IUser;
  to: IUser[];
  message: string;
  read: string[];
  readAt?: string[];
  files: IFile[];
  reactions?: IReaction[];
  totalUnreadMessages?: number;

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
      ref: "user",
      required: true,
    },
    to: {
      type: [mongoose.SchemaTypes.ObjectId],
      ref: "user",
      required: true,
      index: true,
    },
    numberOfParticipants: {
      type: mongoose.SchemaTypes.Number,
      required: false,
    },
    read: {
      type: [
        {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "user",
        },
      ],
      required: false,
    },
    readAt: [
      {
        type: mongoose.SchemaTypes.String,
      },
    ],
    files: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        required: false,
        ref: "file",
        default: [],
      },
    ],
    reactions: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "reaction",
        default: [],
      },
    ],
  },
  {
    timestamps: true,
    virtuals: {},
  }
);

MessageSchema.pre("save", function (next) {
  this.numberOfParticipants = this.to.length;
  this.to.sort();

  next();
});

MessageSchema.pre("deleteOne", async function (next) {
  const message: IMessage = (await this.model
    .findOne(this.getQuery())
    .populate("files")) as IMessage;

  if (message) {
    const filesUuids: string[] = (message.files as IFile[]).map((f) => f.uuid);
    // TODO: we have file ids. Now we need to delete all in upload care

    // Delete all reactions to this message
    Reaction.deleteMany({
      message: new mongoose.Types.ObjectId(message._id.toString()),
    });
  }

  next();
});

const Message = mongoose.model<IMessage, MessageModel>(
  "message",
  MessageSchema
);

export default Message;
