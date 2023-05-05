import mongoose from "mongoose";

import { IField } from "../field/field.model";
import translatedTextSchema, { ITranslatedText } from "../ITranslatedText";
import { IModel } from "../model/model.model";

export enum EventNotificationTrigger {
  OnCreate = "OnCreate",
}

export enum StaticPermission {
  Create = "Create",
  Read = "Read",
  Update = "Update",
  Delete = "Delete",
}

export interface IEntityPermission {
  _id: mongoose.ObjectId;
  model: IModel;
  permissions: StaticPermission[];
  fieldPermissions: IFieldPermission[];
  eventNotifications: IEventNotification[];
}

export interface IEventNotification {
  title: ITranslatedText[];
  text: ITranslatedText[];
  trigger: EventNotificationTrigger;
}

export interface IFieldPermission {
  field: IField;
  permissions: StaticPermission[];
}

interface IEntityPermissionModel extends mongoose.Model<IEntityPermission> {}

const EntityPermissionSchema = new mongoose.Schema(
  {
    model: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "model",
      required: true,
    },
    permissions: [mongoose.SchemaTypes.String],
    fieldPermissions: [
      {
        field: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "field",
          required: true,
        },
        permissions: [mongoose.SchemaTypes.String],
      },
    ],
    eventNotifications: [
      {
        title: translatedTextSchema,
        text: translatedTextSchema,
        trigger: {
          type: mongoose.SchemaTypes.String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IEntityPermission, IEntityPermissionModel>(
  "entityPermission",
  EntityPermissionSchema
);
