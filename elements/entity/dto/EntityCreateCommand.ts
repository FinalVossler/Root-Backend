import mongoose from "mongoose";

type EntityCreateCommand = {
  modelId: mongoose.ObjectId;
  entityFieldValues: {
    fieldId: mongoose.ObjectId;
    value: string;
  }[];
  language: string;
};

export default EntityCreateCommand;
