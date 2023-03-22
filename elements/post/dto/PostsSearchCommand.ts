import PaginationCommand from "../../../globalTypes/PaginationCommand";
import { IPost } from "../post.model";

type PostsSearchCommand = {
  title: string;
  visibilities: IPost["visibility"][];
  posterId: IPost["posterId"];
  paginationCommand: PaginationCommand;
};

export default PostsSearchCommand;
