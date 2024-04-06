import {
  IModelOrderAssociationConfig,
  IModelSection,
  ITranslatedText,
  ModelViewTypeEnum,
} from "roottypes";

import { IEvent } from "../../../event/ports/interfaces/IEvent";
import { IField } from "../../../field/ports/interfaces/IField";
import IModelState from "../../../modelState/ports/interfaces/IModelState";
import IUser from "../../../user/ports/interfaces/IUser";

export interface IModel {
  _id: string;
  name: ITranslatedText[];
  modelFields: IModelField[];
  modelEvents?: IEvent[];
  states?: IModelState[];
  subStates?: IModelState[];

  showInSideMenu?: boolean;
  isForSale?: boolean;
  quantityField?: IField | string;
  priceField?: IField | string;
  imageField?: IField | string;

  isForOrders?: boolean;
  orderAssociationConfig?: IModelOrderAssociationConfig;

  owner?: IUser | string;
  viewType?: ModelViewTypeEnum;
  sections?: IModelSection[];

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
  isVariation?: boolean;
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
