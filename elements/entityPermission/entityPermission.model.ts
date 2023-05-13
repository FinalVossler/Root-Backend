import mongoose from "mongoose";

import { IEntityEventNotification } from "../entityEventNotification/entityEventNotification.model";
import entityEventNotificationRepository from "../entityEventNotification/entityEventNotification.repository";
import { IField } from "../field/field.model";
import translatedTextSchema, { ITranslatedText } from "../ITranslatedText";
import { IModel } from "../model/model.model";
import Role, { IRole } from "../role/role.model";

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
  entityFieldPermissions: IFieldPermission[];
  entityEventNotifications: IEntityEventNotification[];
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
    entityFieldPermissions: [
      {
        field: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "field",
          required: true,
        },
        permissions: [mongoose.SchemaTypes.String],
      },
    ],
    entityEventNotifications: [
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

EntityPermissionSchema.pre("deleteOne", async function (next) {
  const entityPermission: IEntityPermission = (await this.model
    .findOne(this.getQuery())
    .populate({
      path: "entityEventNotifications",
      model: "entityEventNotification",
    })) as IEntityPermission;

  // Deleting the event notifications from the entity permission that's about to get deleted
  const entityEventNotifications: IEntityEventNotification[] =
    entityPermission.entityEventNotifications;

  await entityEventNotificationRepository.deleteByIds(
    entityEventNotifications.map((el) => el._id.toString())
  );

  // Delete the entity permission reference from the roles that use them
  const allRoles: IRole[] = await Role.find({}).populate("entityPermissions");
  const roles = allRoles.filter((r) =>
    r.entityPermissions.find(
      (e) => e._id.toString() === entityPermission._id.toString()
    )
  );

  for (let i = 0; i < roles.length; i++) {
    const role: IRole = roles[i];

    await Role.updateOne(
      { _id: role._id },
      {
        $set: {
          entityPermissions: role.entityPermissions.filter(
            (e) => e._id.toString() !== entityPermission._id.toString()
          ),
        },
      }
    );
  }

  next();
});

export default mongoose.model<IEntityPermission, IEntityPermissionModel>(
  "entityPermission",
  EntityPermissionSchema
);
