import mongoose from "mongoose";
import { IModel } from "../model/model.model";
import { IRole } from "../role/role.model";

export enum StaticPermission {
  Create = "Create",
  Read = "Read",
  Update = "Update",
  Delete = "Delete",
}

export interface IEntityPermission {
  _id: mongoose.ObjectId;
  model: IModel;
  role: IRole;
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
    role: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "role",
      required: true,
    },
    permissons: [
      {
        type: mongoose.SchemaTypes.String,
        default: [
          StaticPermission.Create,
          StaticPermission.Read,
          StaticPermission.Update,
          StaticPermission.Delete,
        ],
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
