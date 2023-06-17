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
});

export default mongoose.model<IModelState, IModelStateModel>(
  "modelState",
  ModelStateSchema
);
