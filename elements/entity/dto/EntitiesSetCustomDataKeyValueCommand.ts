import mongoose from "mongoose";

type EntitiesSetCustomDataKeyValueCommand = {
  entityId: mongoose.ObjectId;
  key: string;
  value: Object;
};

export default EntitiesSetCustomDataKeyValueCommand;
