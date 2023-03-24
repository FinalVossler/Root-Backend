import mongoose from "mongoose";
import { IFile } from "../../file/file.model";

type EntityUpdateCommand = {
  _id: mongoose.ObjectId;
  modelId: mongoose.ObjectId;
  entityFieldValues: {
    fieldId: mongoose.ObjectId;
    value: string;
    files: IFile[];
  }[];
  language: string;
};

export default EntityUpdateCommand;
