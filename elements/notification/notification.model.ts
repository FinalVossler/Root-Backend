import mongoose from "mongoose";

import { IFile } from "../file/file.model";
import translatedTextSchema, { ITranslatedText } from "../ITranslatedText";
import { IUserReadDto } from "roottypes";

export interface INotification {
  _id: string;
  text: ITranslatedText[];
  link: string;
  image?: IFile | string;
  clickedBy: string[];
  to: (IUserReadDto | string)[];

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

const Notification = mongoose.model<INotification, INotificationModel>(
  "notification",
  NotificationSchema
);

export default Notification;
