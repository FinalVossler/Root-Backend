import mongoose from "mongoose";

import { ITranslatedText, ModelStateTypeEnum } from "roottypes";
import translatedTextSchema from "../translatedText/adapters/translatedText.mongooseSchema";

export interface IModelState {
  _id: string;
  name: ITranslatedText[];
  stateType: ModelStateTypeEnum;
  // Means that it will block entities from showing in other states
  exlusive?: boolean;
}

export interface IModelStateModel extends mongoose.Model<IModelState> {}

const ModelStateSchema = new mongoose.Schema({
  name: {
    type: translatedTextSchema,
    required: true,
  },
  stateType: {
    type: mongoose.SchemaTypes.String,
    required: true,
  },
  exlusive: {
    type: mongoose.SchemaTypes.Boolean,
    required: false,
  },
});

const ModelState = mongoose.model<IModelState, IModelStateModel>(
  "modelState",
  ModelStateSchema
);

export default ModelState;
