import mongoose from "mongoose";

import File from "../../file/adapters/file.mongoose.model";
import translatedTextSchema from "../../translatedText/adapters/translatedText.mongooseSchema";
import IEntity from "../ports/interfaces/IEntity";

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
    owner: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "user",
    },
  },
  {
    timestamps: true,
  }
);

const Entity = mongoose.model<IEntity, IEntityModel>("entity", EntitySchema);

export default Entity;
