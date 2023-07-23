import mongoose from "mongoose";

import translatedTextSchema, { ITranslatedText } from "../ITranslatedText";
import { IEntityPermission } from "../entityPermission/entityPermission.model";
import entityPermissionRepository from "../entityPermission/entityPermission.repository";

export enum Permission {
  EditConfiguration = "EditConfiguration",

  CreatePage = "CreatePage",
  ReadPage = "ReadPage",
  UpdatePage = "UpdatePage",
  DeletePage = "DeletePage",

  CreatePost = "CreatePost",

  CreateField = "CreateField",
  ReadField = "ReadField",
  UpdateField = "UpdateField",
  DeleteField = "DeleteField",

  CreateModel = "CreateModel",
  ReadModel = "ReadModel",
  UpdateModel = "UpdateModel",
  DeleteModel = "DeleteModel",

  CreateUser = "CreateUser",
  ReadUser = "ReadUser",
  UpdateUser = "UpdateUser",
  DeleteUser = "DeleteUser",

  CreateRole = "CreateRole",
  ReadRole = "ReadRole",
  UpdateRole = "UpdateRole",
  DeleteRole = "DeleteRole",

  CreateMicroFrontend = "CreateMicroFrontend",
  UpdateMicroFrontend = "UpdateMicroFrontend",
  DeleteMicroFrontend = "DeleteMicroFrontend",
}

export interface IRole {
  _id: mongoose.ObjectId;
  name: ITranslatedText[];
  permissions: Permission[];
  entityPermissions: IEntityPermission[];

  createdAt: string;
  updatedAt: string;
}

interface IRoleModel extends mongoose.Model<IRole> {}

const RoleSchema = new mongoose.Schema<IRole>(
  {
    name: {
      type: translatedTextSchema,
      required: true,
    },
    permissions: [
      {
        type: mongoose.SchemaTypes.String,
        required: true,
      },
    ],
    entityPermissions: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "entityPermission",
      },
    ],
  },
  {
    timestamps: true,
  }
);

RoleSchema.pre("deleteOne", async function (next) {
  const role: IRole = (await this.model.findOne(this.getQuery())) as IRole;

  await entityPermissionRepository.deleteByIds(
    role.entityPermissions.map((p) => p._id.toString())
  );

  next();
});

const model = mongoose.model<IRole, IRoleModel>("role", RoleSchema);

export default model;
