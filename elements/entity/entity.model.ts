import mongoose from "mongoose";

import { IField } from "../field/field.model";
import translatedTextSchema, { ITranslatedText } from "../ITranslatedText";
import Model, { IModel } from "../model/model.model";

export interface IEntity {
  _id: mongoose.ObjectId;
  model: IModel;
  entityFieldValues: IEntityFieldValue[];
}

export interface IEntityFieldValue {
  field: IField;
  value: ITranslatedText[];
}

interface IEntityModel extends mongoose.Model<IEntity> {}

const EntitySchema = new mongoose.Schema<IEntity>(
  {
    model: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: Model.modelName,
    },
    entityFieldValues: [
      {
        field: {
          type: mongoose.SchemaTypes.ObjectId,
          required: true,
        },
        value: translatedTextSchema,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const model = mongoose.model<IEntity, IEntityModel>("entity", EntitySchema);

export default model;
