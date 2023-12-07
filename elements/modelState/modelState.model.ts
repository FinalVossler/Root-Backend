import mongoose from "mongoose";

import translatedTextSchema, { ITranslatedText } from "../ITranslatedText";

export enum ModelStateType {
  ParentState = "ParentState",
  SubState = "SubState",
}

export interface IModelState {
  _id: mongoose.Types.ObjectId;
  name: ITranslatedText[];
  stateType: ModelStateType;
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
