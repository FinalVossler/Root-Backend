import mongoose from "mongoose";

import translatedTextSchema, { ITranslatedText } from "../ITranslatedText";

export interface IFieldTableElement {
  _id: mongoose.Types.ObjectId;
  name: ITranslatedText[];
}

interface IFieldTableElementModel extends mongoose.Model<IFieldTableElement> {}

const FieldTableElementSchema = new mongoose.Schema({
  name: {
    type: translatedTextSchema,
    required: true,
  },
});

export default mongoose.model<IFieldTableElement, IFieldTableElementModel>(
  "fieldTableElement",
  FieldTableElementSchema
);
