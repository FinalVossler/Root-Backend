import mongoose from "mongoose";

const translatedTextSchema = [
  {
    text: mongoose.SchemaTypes.String,
    language: mongoose.SchemaTypes.String,
  },
];

export default translatedTextSchema;
