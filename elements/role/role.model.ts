import mongoose from "mongoose";

import translatedTextSchema, { ITranslatedText } from "../ITranslatedText";

export interface IRole {
  _id: mongoose.ObjectId;
  name: ITranslatedText[];

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
  },
  {
    timestamps: true,
  }
);

const model = mongoose.model<IRole, IRoleModel>("role", RoleSchema);

export default model;
