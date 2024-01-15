import mongoose from "mongoose";

import { IField } from "../field/field.model";
import { IFieldTableElement } from "../fieldTableElement/fieldTableElement.model";
import File, { IFile } from "../file/file.model";
import translatedTextSchema, { ITranslatedText } from "../ITranslatedText";
import { IModel } from "../model/model.model";
import { IUser } from "../user/user.model";

export interface IEntity {
  _id: mongoose.Types.ObjectId;
  model: IModel;
  entityFieldValues: IEntityFieldValue[];
  assignedUsers?: (IUser | string)[];
  customData?: string;

  createdAt: string;
  updatedAt: string;
}

export interface IEntityFieldValue {
  field: IField | string;
  value: ITranslatedText[];
  files: (IFile | string)[];
  tableValues?: IEntityTableFieldCaseValue[];
  yearTableValues?: IEntityYearTableFieldRowValues[];
}

export interface IEntityTableFieldCaseValue {
  column: IFieldTableElement | string;
  row: IFieldTableElement | string;
  value: ITranslatedText[];
}

export interface IEntityYearTableFieldRowValues {
  row: IFieldTableElement | string;
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
    customData: {
      type: mongoose.SchemaTypes.String,
    },
  },
  {
    timestamps: true,
  }
);

const Entity = mongoose.model<IEntity, IEntityModel>("entity", EntitySchema);

export default Entity;
