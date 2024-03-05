import mongoose from "mongoose";

import IEntityPermission from "../ports/interfaces/IEntityPermission";
import translatedTextSchema from "../../translatedText/adapters/translatedText.mongooseSchema";

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

const EntityPermission = mongoose.model<
  IEntityPermission,
  IEntityPermissionModel
>("entityPermission", EntityPermissionSchema);

export default EntityPermission;
