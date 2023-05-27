import mongoose from "mongoose";

import { IFile } from "../file/file.model";
import translatedTextSchema, { ITranslatedText } from "../ITranslatedText";
import { IUser } from "../user/user.model";

export interface INotification {
  _id: mongoose.ObjectId;
  text: ITranslatedText[];
  link: string;
  image?: IFile;
  notifiedUser: IUser;
  clicked?: boolean;

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
    notifiedUser: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "user",
      required: true,
    },
    clicked: {
      type: mongoose.SchemaTypes.Boolean,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<INotification, INotificationModel>(
  "notification",
  NotificationSchema
);
