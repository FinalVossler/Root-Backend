import { IPost } from "../post.model";

type PostCreateCommand = {
  title?: IPost["title"];
  posterId: IPost["posterId"];
  content?: IPost["content"];
  files: IPost["files"];
  visibility: IPost["visibility"];
  design: IPost["design"];
};

export default PostCreateCommand;
