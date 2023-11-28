import mongoose from "mongoose";

import { EntityFieldValueCommand } from "./EntityCreateCommand";

type EntityUpdateCommand = {
  _id: mongoose.Types.ObjectId;
  modelId: mongoose.Types.ObjectId;
  entityFieldValues: EntityFieldValueCommand[];
  assignedUsersIds: string[];
  language: string;
};

export default EntityUpdateCommand;
