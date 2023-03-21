import mongoose from "mongoose";
import translatedTextSchema, { ITranslatedText } from "../ITranslatedText";

export enum FieldType {
  Number = "Number",
  Text = "Text",
  Paragraph = "Paragraph",
}

export interface IField {
  _id: mongoose.ObjectId;
  name: ITranslatedText[];
  type: FieldType;
}

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
      default: FieldType.Text,
    },
  },
  {
    timestamps: true,
  }
);

const model = mongoose.model<IField, IFieldModel>("field", FieldSchema);

export default model;
