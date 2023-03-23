import mongoose from "mongoose";

type EntityUpdateCommand = {
  _id: mongoose.ObjectId;
  model: mongoose.ObjectId;
  entityFieldValues: {
    field: mongoose.ObjectId;
    value: string;
  }[];
  language: string;
};

export default EntityUpdateCommand;
