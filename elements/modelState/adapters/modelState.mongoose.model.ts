import mongoose from "mongoose";

import translatedTextSchema from "../../translatedText/adapters/translatedText.mongooseSchema";
import IModelState from "../ports/interfaces/IModelState";

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
