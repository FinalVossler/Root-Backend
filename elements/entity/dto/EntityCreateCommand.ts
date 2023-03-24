import mongoose from "mongoose";
import { IFile } from "../../file/file.model";

type EntityCreateCommand = {
  modelId: mongoose.ObjectId;
  entityFieldValues: EntityFieldValueCommand[];
  language: string;
};

export type EntityFieldValueCommand = {
  fieldId: mongoose.ObjectId;
  value: string;
  files: IFile[];
};

export default EntityCreateCommand;
