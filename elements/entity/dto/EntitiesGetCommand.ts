import mongoose from "mongoose";
import PaginationCommand from "../../../globalTypes/PaginationCommand";

type EntitiesGetCommand = {
  model: mongoose.ObjectId;
  paginationCommand: PaginationCommand;
};

export default EntitiesGetCommand;
