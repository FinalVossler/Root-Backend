import mongoose from "mongoose";

import translatedTextSchema, { ITranslatedText } from "../ITranslatedText";

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
}

export interface IRole {
  _id: mongoose.ObjectId;
  name: ITranslatedText[];
  permissions: Permission[];

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
  },
  {
    timestamps: true,
  }
);

const model = mongoose.model<IRole, IRoleModel>("role", RoleSchema);

export default model;
