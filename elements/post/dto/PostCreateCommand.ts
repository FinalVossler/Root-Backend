import { IPost } from "../post.model";

type PostCreateCommand = {
  title?: IPost["title"];
  subTitle?: IPost["subTitle"];
  posterId: IPost["posterId"];
  content?: IPost["content"];
  files: IPost["files"];
  visibility: IPost["visibility"];
  design: IPost["design"];
  children: string[];
};

export default PostCreateCommand;
