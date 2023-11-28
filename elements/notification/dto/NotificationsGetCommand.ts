import mongoose from "mongoose";

import PaginationCommand from "../../../globalTypes/PaginationCommand";

type NotificationsGetCommand = {
  userId: mongoose.Types.ObjectId;
  paginationCommand: PaginationCommand;
};

export default NotificationsGetCommand;
