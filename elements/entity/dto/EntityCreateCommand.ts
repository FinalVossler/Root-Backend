import mongoose from "mongoose";

type EntityCreateCommand = {
  model: mongoose.ObjectId;
  entityFieldValues: {
    field: mongoose.ObjectId;
    value: string;
  }[];
  language: string;
};

export default EntityCreateCommand;
