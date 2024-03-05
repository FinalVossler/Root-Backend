import mongoose from "mongoose";
import { ITranslatedText } from "roottypes";
import translatedTextSchema from "../translatedText/adapters/translatedText.mongooseSchema";

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
