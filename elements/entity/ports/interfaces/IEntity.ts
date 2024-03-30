import { ITranslatedText } from "roottypes";

import { IField } from "../../../field/ports/interfaces/IField";
import IModel from "../../../model/ports/interfaces/IModel";
import IUser from "../../../user/ports/interfaces/IUser";
import IFile from "../../../file/ports/interfaces/IFile";
import IFieldTableElement from "../../../fieldTableElement/ports/IFieldTableElement";
import IShippingMethod from "../../../ecommerce/shippingMethod/ports/interfaces/IShippingMethod";

export interface IEntityFieldValue {
  field: IField | string;
  value: ITranslatedText[];
  files: (IFile | string)[];
  tableValues?: IEntityTableFieldCaseValue[];
  yearTableValues?: IEntityYearTableFieldRowValues[];
}

export interface IEntityTableFieldCaseValue {
  column: IFieldTableElement | string;
  row: IFieldTableElement | string;
  value: ITranslatedText[];
}

export interface IEntityYearTableFieldRowValues {
  row: IFieldTableElement | string;
  values: {
    year: number;
    value: ITranslatedText[];
  }[];
}

export default interface IEntity {
  _id: string;
  model: IModel;
  entityFieldValues: IEntityFieldValue[];
  assignedUsers?: (IUser | string)[];
  customData?: string;
  owner?: IUser | string;
  availableShippingMethods?: (IShippingMethod | string)[];

  createdAt: string;
  updatedAt: string;
}
