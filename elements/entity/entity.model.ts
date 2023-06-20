import mongoose from "mongoose";

import { IField } from "../field/field.model";
import File, { IFile } from "../file/file.model";
import translatedTextSchema, { ITranslatedText } from "../ITranslatedText";
import { IModel } from "../model/model.model";
import { IUser } from "../user/user.model";

export interface IEntity {
  _id: mongoose.ObjectId;
  model: IModel;
  entityFieldValues: IEntityFieldValue[];
  assignedUsers?: IUser[];

  createdAt: string;
  updatedAt: string;
}

export interface IEntityFieldValue {
  field: IField;
  value: ITranslatedText[];
  files: IFile[];
}

interface IEntityModel extends mongoose.Model<IEntity> {}

const EntitySchema = new mongoose.Schema<IEntity>(
  {
    model: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "model",
      index: true,
    },
    entityFieldValues: [
      {
        field: {
          type: mongoose.SchemaTypes.ObjectId,
          required: true,
        },
        value: translatedTextSchema,
        files: [
          {
            type: mongoose.SchemaTypes.ObjectId,
            ref: File.modelName,
          },
        ],
      },
    ],
    assignedUsers: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "user",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const model = mongoose.model<IEntity, IEntityModel>("entity", EntitySchema);

export default model;
