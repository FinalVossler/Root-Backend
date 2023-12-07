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

const FieldTableElement = mongoose.model<
  IFieldTableElement,
  IFieldTableElementModel
>("fieldTableElement", FieldTableElementSchema);

export default FieldTableElement;
