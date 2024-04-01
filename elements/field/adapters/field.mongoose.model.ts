import mongoose from "mongoose";

import EventSchema from "../../event/adapters/event.mongoose.model";
import { FieldTypeEnum } from "roottypes";
import translatedTextSchema from "../../translatedText/adapters/translatedText.mongooseSchema";
import { IField } from "../ports/interfaces/IField";

interface IFieldModel extends mongoose.Model<IField> {}

const FieldSchema = new mongoose.Schema<IField>(
  {
    name: {
      type: translatedTextSchema,
      required: true,
    },
    type: {
      type: mongoose.SchemaTypes.String,
      required: true,
      default: FieldTypeEnum.Text,
    },
    canChooseFromExistingFiles: {
      type: mongoose.SchemaTypes.Boolean,
      required: false,
      default: true,
    },
    options: [
      {
        value: mongoose.SchemaTypes.String,
        label: translatedTextSchema,
      },
    ],
    fieldEvents: [EventSchema],
    tableOptions: {
      name: {
        type: translatedTextSchema,
        required: false,
      },
      columns: [
        {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "fieldTableElement",
        },
      ],
      rows: [
        {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "fieldTableElement",
        },
      ],
      yearTable: {
        type: mongoose.SchemaTypes.Boolean,
      },
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

const Field = mongoose.model<IField, IFieldModel>("field", FieldSchema);

export default Field;
