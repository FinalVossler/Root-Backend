import mongoose from "mongoose";

type EntitiesSetCustomDataKeyValueCommand = {
  entityId: mongoose.Types.ObjectId;
  key: string;
  value: Object;
};

export default EntitiesSetCustomDataKeyValueCommand;
