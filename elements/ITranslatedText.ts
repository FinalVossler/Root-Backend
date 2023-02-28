import mongoose from "mongoose";

export interface ITranslatedText {
  text: string;
  language: string;
}

const translatedTextSchema = [
  {
    text: mongoose.SchemaTypes.String,
    language: mongoose.SchemaTypes.String,
  },
];

export default translatedTextSchema;
