import mongoose from "mongoose";

import { IEntityEventNotification } from "../entityEventNotification/entityEventNotification.model";
import entityEventNotificationRepository from "../entityEventNotification/entityEventNotification.repository";
import { IModel } from "../model/adapters/model.mongoose.model";
import Role, { IRole } from "../role/role.model";
import { StaticPermissionEnum } from "roottypes";
import translatedTextSchema from "../translatedText/adapters/translatedText.mongooseSchema";
import { IField } from "../field/ports/interfaces/IField";

export interface IEntityPermission {
  _id: string;
  model: IModel | string;
  permissions: StaticPermissionEnum[];
  entityFieldPermissions: IFieldPermission[];
  entityEventNotifications: IEntityEventNotification[];
  entityUserAssignmentPermissionsByRole?: IEntityUserAssignmentPermissionsByRole;
}

export interface IFieldPermission {
  field: IField | string;
  permissions: StaticPermissionEnum[];
}

export interface IEntityUserAssignmentPermissionsByRole {
  canAssignToUserFromSameRole: boolean;
  otherRoles: (IRole | string)[];
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
    entityUserAssignmentPermissionsByRole: {
      canAssignToUserFromSameRole: {
        type: mongoose.SchemaTypes.Boolean,
      },
      otherRoles: [
        {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "role",
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

EntityPermissionSchema.pre("deleteOne", async function (next) {
  const entityPermission: IEntityPermission | undefined = (await this.model
    .findOne(this.getQuery())
    .populate({
      path: "entityEventNotifications",
      model: "entityEventNotification",
    })) as IEntityPermission;

  if (!entityPermission) {
    return;
  }

  // Deleting the event notifications from the entity permission that's about to get deleted
  const entityEventNotifications: IEntityEventNotification[] =
    entityPermission.entityEventNotifications;

  await entityEventNotificationRepository.deleteByIds(
    entityEventNotifications.map((el) => el._id.toString())
  );

  // Delete the entity permission reference from the roles that use them
  const allRoles: IRole[] = await Role.find({}).populate("entityPermissions");
  const roles = allRoles.filter((r) =>
    (r.entityPermissions as IEntityPermission[]).find(
      (e) => e._id.toString() === entityPermission._id.toString()
    )
  );

  for (let i = 0; i < roles.length; i++) {
    const role: IRole = roles[i];

    await Role.updateOne(
      { _id: role._id },
      {
        $set: {
          entityPermissions: (
            role.entityPermissions as IEntityPermission[]
          ).filter((e) => e._id.toString() !== entityPermission._id.toString()),
        },
      }
    );
  }

  next();
});

const EntityPermission = mongoose.model<
  IEntityPermission,
  IEntityPermissionModel
>("entityPermission", EntityPermissionSchema);

export default EntityPermission;
