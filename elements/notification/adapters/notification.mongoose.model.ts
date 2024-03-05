import mongoose from "mongoose";

import translatedTextSchema from "../../translatedText/adapters/translatedText.mongooseSchema";
import INotification from "../ports/interfaces/INotification";

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
