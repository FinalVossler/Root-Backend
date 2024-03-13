import mongoose from "mongoose";

import Reaction from "../../reaction/adapters/reaction.mongoose.model";
import IMessage from "../ports/interfaces/IMessage";
import IFile from "../../../file/ports/interfaces/IFile";

interface MessageModel extends mongoose.Model<IMessage> {}

const MessageSchema = new mongoose.Schema(
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
