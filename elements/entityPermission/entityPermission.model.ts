import mongoose from "mongoose";
import { IModel } from "../model/model.model";

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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IEntityPermission, IEntityPermissionModel>(
  "entityPermission",
  EntityPermissionSchema
);
