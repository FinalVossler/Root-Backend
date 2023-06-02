import mongoose from "mongoose";

import { IFile } from "../file/file.model";
import translatedTextSchema, { ITranslatedText } from "../ITranslatedText";
import { IUser } from "../user/user.model";

export interface INotification {
  _id: mongoose.ObjectId;
  text: ITranslatedText[];
  link: string;
  image?: IFile;
  clickedBy: mongoose.ObjectId[];
  to: mongoose.ObjectId[];

  createdAt: string;
  updatedAt: string;
}

interface INotificationModel extends mongoose.Model<INotification> {}

const NotificationSchema = new mongoose.Schema(
  {
    text: {
      type: translatedTextSchema,
      required: true,
    },
    link: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    image: {
      type: mongoose.SchemaTypes.ObjectId,
      required: false,
      ref: "file",
    },
    to: {
      type: [mongoose.SchemaTypes.ObjectId],
      ref: "user",
      required: true,
      index: true,
    },
    clickedBy: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        required: false,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<INotification, INotificationModel>(
  "notification",
  NotificationSchema
);
