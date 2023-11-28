import mongoose from "mongoose";
import PaginationCommand from "../../../globalTypes/PaginationCommand";

type EntitiesGetCommand = {
  modelId: mongoose.Types.ObjectId;
  paginationCommand: PaginationCommand;
};

export default EntitiesGetCommand;
