import { ITranslatedText } from "roottypes";
import { IField } from "../../../field/ports/interfaces/IField";
import IModel from "../../../model/ports/interfaces/IModel";
import IUser from "../../../user/ports/interfaces/IUser";
import { IFieldTableElement } from "../../../fieldTableElement/adapters/fieldTableElement.mongoose.model";
import IFile from "../../../file/ports/interfaces/IFile";

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

  createdAt: string;
  updatedAt: string;
}
