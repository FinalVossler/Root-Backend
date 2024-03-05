import mongoose from "mongoose";

import translatedTextSchema from "../../translatedText/adapters/translatedText.mongooseSchema";
import IEntityEventNotification from "../ports/interfaces/IEntityEventNotification";

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
