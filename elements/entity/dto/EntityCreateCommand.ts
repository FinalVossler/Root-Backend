import mongoose from "mongoose";

import { IFile } from "../../file/file.model";

type EntityCreateCommand = {
  modelId: mongoose.ObjectId;
  entityFieldValues: EntityFieldValueCommand[];
  assignedUsersIds: string[];
  language: string;
};

export type EntityFieldValueCommand = {
  fieldId: mongoose.ObjectId;
  value: string;
  files: IFile[];

  tableValues: IEntityTableFieldCaseValueCommand[];
  yearTableValues: IEntityYearTableFieldRowValuesCommand[];
};

export type IEntityTableFieldCaseValueCommand = {
  columnId: string;
  rowId: string;
  value: string;
};

export type IEntityYearTableFieldRowValuesCommand = {
  rowId: string;
  values: {
    year: number;
    value: string;
  }[];
};

export default EntityCreateCommand;
