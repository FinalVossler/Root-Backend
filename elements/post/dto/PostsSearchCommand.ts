import PaginationCommand from "../../../globalTypes/PaginationCommand";
import { IPost } from "../post.model";

type PostsSearchCommand = {
  title: IPost["title"];
  visibilities: IPost["visibility"][];
  posterId: IPost["posterId"];
  paginationCommand: PaginationCommand;
};

export default PostsSearchCommand;
