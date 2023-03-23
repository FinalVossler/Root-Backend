import mongoose from "mongoose";

type EntityUpdateCommand = {
  _id: mongoose.ObjectId;
  modelId: mongoose.ObjectId;
  entityFieldValues: {
    fieldId: mongoose.ObjectId;
    value: string;
  }[];
  language: string;
};

export default EntityUpdateCommand;
