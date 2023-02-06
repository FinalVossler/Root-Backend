import mongoose from "mongoose";

import PaginationCommand from "../../../globalTypes/PaginationCommand";
import PostVisibility from "../../../globalTypes/PostVisibility";

type PostsGetCommandd = {
  userId: mongoose.ObjectId;
  visibilities: PostVisibility[];
  paginationCommand: PaginationCommand;
};

export default PostsGetCommandd;
