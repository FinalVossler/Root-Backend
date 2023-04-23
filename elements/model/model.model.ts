import mongoose from "mongoose";

import { IField } from "../field/field.model";
import translatedTextSchema, { ITranslatedText } from "../ITranslatedText";

export interface IModel {
  _id: mongoose.ObjectId;
  name: ITranslatedText[];
  modelFields: IModelField[];

  createdAt: string;
  updatedAt: string;
}

export interface IModelField {
  field: IField;
  required: boolean;
  conditions?: IModelFieldCondition[];
}

export enum ModelFieldConditionType {
  SuperiorTo = "SuperiorTo",
  InferiorTo = "InferiorTo",
  Equal = "Equal",
}

export interface IModelFieldCondition {
  field: IField;
  conditionType: ModelFieldConditionType;
  value: number | string;
}

interface IModelModel extends mongoose.Model<IModel> {}

const ModelSchema = new mongoose.Schema<IModel>(
  {
    name: {
      type: translatedTextSchema,
      required: true,
    },
    modelFields: [
      {
        field: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "field",
        },
        required: {
          type: mongoose.SchemaTypes.Boolean,
        },
        conditions: [
          {
            field: {
              type: mongoose.SchemaTypes.ObjectId,
              ref: "field",
              required: false,
            },
            conditionType: {
              type: mongoose.SchemaTypes.String,
            },
            value: {
              type: mongoose.SchemaTypes.String,
            },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

const model = mongoose.model<IModel, IModelModel>("model", ModelSchema);

export default model;
