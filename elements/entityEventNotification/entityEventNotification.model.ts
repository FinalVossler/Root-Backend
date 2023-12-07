import mongoose from "mongoose";

import translatedTextSchema, { ITranslatedText } from "../ITranslatedText";

export enum EntityEventNotificationTrigger {
  OnCreate = "OnCreate",
  OnAssigned = "OnAssigned",
}

export interface IEntityEventNotification {
  _id: mongoose.Types.ObjectId;
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

const EntityEventNotification = mongoose.model<
  IEntityEventNotification,
  IEntityEventNotificationModel
>("entityEventNotification", EntityEventNotificationSchema);

export default EntityEventNotification;
