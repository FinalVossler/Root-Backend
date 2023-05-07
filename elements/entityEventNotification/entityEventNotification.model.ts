import mongoose from "mongoose";

import translatedTextSchema, { ITranslatedText } from "../ITranslatedText";

export enum EntityEventNotificationTrigger {
  OnCreate = "OnCreate",
}

export interface IEntityEventNotification {
  _id: mongoose.ObjectId;
  title: ITranslatedText[];
  text: ITranslatedText[];
  trigger: EntityEventNotificationTrigger;
}

interface IEntityEventNotificationModel
  extends mongoose.Model<IEntityEventNotification> {}

const EntityEventNotificationSchema = new mongoose.Schema({
  title: translatedTextSchema,
  text: translatedTextSchema,
  trigger: {
    type: mongoose.SchemaTypes.String,
    required: true,
  },
});

export default mongoose.model<
  IEntityEventNotification,
  IEntityEventNotificationModel
>("entityEventNotification", EntityEventNotificationSchema);
