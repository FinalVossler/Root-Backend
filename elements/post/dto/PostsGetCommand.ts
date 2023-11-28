import mongoose from "mongoose";

import PaginationCommand from "../../../globalTypes/PaginationCommand";
import { PostVisibility } from "../post.model";

type PostsGetCommand = {
  userId: mongoose.Types.ObjectId;
  visibilities: PostVisibility[];
  paginationCommand: PaginationCommand;
};

export default PostsGetCommand;
