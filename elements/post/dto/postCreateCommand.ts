import { IPost } from "../post.model";

type PostCreateCommand = {
  title?: IPost["title"];
  poster: IPost["poster"];
  content?: IPost["content"];
  files: IPost["files"];
};

export default PostCreateCommand;
