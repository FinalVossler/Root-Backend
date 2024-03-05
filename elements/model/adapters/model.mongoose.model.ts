import mongoose from "mongoose";

import { IModelState } from "../../modelState/modelState.model";
import { IField } from "../../field/ports/interfaces/IField";
import IModel from "../ports/interfaces/IModel";
import translatedTextSchema from "../../translatedText/adapters/translatedText.mongooseSchema";
import EventSchema from "../../event/adapters/event.mongoose.model";

//#region model fields
export interface IModelField {
  field: IField | string;
  required: boolean;
  conditions?: IModelFieldCondition[];
  states?: IModelState[];
  mainField?: boolean;
  stickInTable?: boolean;
}

export interface IModelFieldCondition {
  field?: IField | string;
  conditionType: ModelFieldConditionTypeEnum;
  value?: number | string;
  modelState?: IModelState | string;
}

export enum ModelFieldConditionTypeEnum {
  SuperiorTo = "SuperiorTo",
  SuperiorOrEqualTo = "SuperiorOrEqualTo",
  InferiorTo = "InferiorTo",
  InferiorOrEqualTo = "InferiorOrEqualTo",
  Equal = "Equal",
  ValueInferiorOrEqualToCurrentYearPlusValueOfFieldAndSuperiorOrEqualToCurrentYear = "ValueInferiorOrEqualToCurrentYearPlusValueOfFieldAndSuperiorOrEqualToCurrentYear",
  StateConditionsMet = "StateConditionsMet",
  IfYearTableThenNumberOfYearsInTheFutureIsEqualToValueOfField = "IfYearTableThenNumberOfYearsInTheFutureIsEqualToValueOfField",
}
//#endregion model fields

interface IModelModel extends mongoose.Model<IModel> {}

const ModelSchema = new mongoose.Schema<IModel>(
  {
    name: {
      type: translatedTextSchema,
      required: true,
    },
    modelFields: [
      {
        field: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "field",
          required: false,
        },
        required: {
          type: mongoose.SchemaTypes.Boolean,
        },
        conditions: [
          {
            field: {
              type: mongoose.SchemaTypes.ObjectId,
              ref: "field",
              required: false,
            },
            conditionType: {
              type: mongoose.SchemaTypes.String,
            },
            value: {
              type: mongoose.SchemaTypes.String,
              required: false,
            },
            modelState: {
              type: mongoose.SchemaTypes.ObjectId,
              ref: "modelState",
            },
          },
        ],
        states: [
          {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "modelState",
          },
        ],
        mainField: {
          type: mongoose.SchemaTypes.Boolean,
          required: false,
        },
        stickInTable: {
          type: mongoose.SchemaTypes.Boolean,
          required: false,
        },
      },
    ],
    modelEvents: [EventSchema],
    states: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "modelState",
      },
    ],
    subStates: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "modelState",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Model = mongoose.model<IModel, IModelModel>("model", ModelSchema);

export default Model;
