import mongoose from "mongoose";

import PaginationCommand from "../../../globalTypes/PaginationCommand";

type MessageGetBetweenUsersCommand = {
  paginationCommand: PaginationCommand;
  usersIds: [mongoose.ObjectId];
};

export default MessageGetBetweenUsersCommand;
