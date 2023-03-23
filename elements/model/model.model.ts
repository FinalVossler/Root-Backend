import mongoose from "mongoose";
import Field, { IField } from "../field/field.model";
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
          ref: Field.modelName,
        },
        required: {
          type: mongoose.SchemaTypes.Boolean,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const model = mongoose.model<IModel, IModelModel>("model", ModelSchema);

export default model;
