import mongoose from "mongoose";

import translatedTextSchema from "../../translatedText/adapters/translatedText.mongooseSchema";
import IFieldTableElement from "../ports/IFieldTableElement";

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
