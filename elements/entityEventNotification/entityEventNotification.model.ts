import mongoose from "mongoose";

import translatedTextSchema, { ITranslatedText } from "../ITranslatedText";
import { EntityEventNotificationTriggerEnum } from "roottypes";

export interface IEntityEventNotification {
  _id: string;
  title: ITranslatedText[];
  text: ITranslatedText[];
  trigger: EntityEventNotificationTriggerEnum;
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
