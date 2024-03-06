import { ITranslatedText } from "roottypes";

import { IEvent } from "../../../event/ports/interfaces/IEvent";
import { IField } from "../../../field/ports/interfaces/IField";
import IModelState from "../../../modelState/ports/interfaces/IModelState";

export interface IModel {
  _id: string;
  name: ITranslatedText[];
  modelFields: IModelField[];
  modelEvents?: IEvent[];
  states?: IModelState[];
  subStates?: IModelState[];

  createdAt: string;
  updatedAt: string;
}

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

export default IModel;
