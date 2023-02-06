import { IPost } from "../post.model";

type PostCreateCommand = {
  title?: IPost["title"];
  posterId: IPost["posterId"];
  content?: IPost["content"];
  files: IPost["files"];
};

export default PostCreateCommand;
