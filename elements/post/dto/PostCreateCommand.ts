import { IPost } from "../post.model";

type PostCreateCommand = {
  title?: string;
  subTitle?: IPost["subTitle"];
  posterId: IPost["posterId"];
  content?: IPost["content"];
  files: IPost["files"];
  visibility: IPost["visibility"];
  design: IPost["design"];
  children: string[];
  language: string;
  code?: string;
};

export default PostCreateCommand;
