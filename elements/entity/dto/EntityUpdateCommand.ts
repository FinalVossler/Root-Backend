import mongoose from "mongoose";

import { EntityFieldValueCommand } from "./EntityCreateCommand";

type EntityUpdateCommand = {
  _id: mongoose.ObjectId;
  modelId: mongoose.ObjectId;
  entityFieldValues: EntityFieldValueCommand[];
  language: string;
};

export default EntityUpdateCommand;
