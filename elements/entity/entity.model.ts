import mongoose from "mongoose";

import { IField } from "../field/field.model";
import { IFieldTableElement } from "../fieldTableElement/fieldTableElement.model";
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
  tableValues?: IEntityTableFieldCaseValue[];
  yearTableValues?: IEntityYearTableFieldRowValues[];
}

export interface IEntityTableFieldCaseValue {
  column: IFieldTableElement;
  row: IFieldTableElement;
  value: ITranslatedText[];
}

export interface IEntityYearTableFieldRowValues {
  row: IFieldTableElement;
  values: {
    year: number;
    value: ITranslatedText[];
  }[];
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
        tableValues: [
          {
            column: {
              type: mongoose.SchemaTypes.ObjectId,
              ref: "fieldTableElement",
            },
            row: {
              type: mongoose.SchemaTypes.ObjectId,
              ref: "fieldTableElement",
            },
            value: translatedTextSchema,
          },
        ],
        yearTableValues: [
          {
            row: {
              type: mongoose.SchemaTypes.ObjectId,
              ref: "fieldTableElement",
            },
            values: [
              {
                year: {
                  type: mongoose.SchemaTypes.Number,
                },
                value: translatedTextSchema,
              },
            ],
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
