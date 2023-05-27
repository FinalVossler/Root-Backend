import mongoose from "mongoose";

import PaginationCommand from "../../../globalTypes/PaginationCommand";

type NotificationsGetCommand = {
  userId: mongoose.ObjectId;
  paginationCommand: PaginationCommand;
};

export default NotificationsGetCommand;
