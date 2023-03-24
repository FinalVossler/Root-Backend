import mongoose from "mongoose";
import { IFile } from "../file/file.model";
import translatedTextSchema, { ITranslatedText } from "../ITranslatedText";

export enum FieldType {
  Number = "Number",
  Text = "Text",
  Paragraph = "Paragraph",
  File = "File",
}

export interface IField {
  _id: mongoose.ObjectId;
  name: ITranslatedText[];
  type: FieldType;

  createdAt: string;
  updatedAt: string;
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
