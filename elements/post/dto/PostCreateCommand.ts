import { IPost } from "../post.model";

type PostCreateCommand = {
  title?: string;
  subTitle?: string;
  posterId: IPost["posterId"];
  content?: string;
  files: IPost["files"];
  visibility: IPost["visibility"];
  design: IPost["design"];
  children: string[];
  language: string;
  code?: string;
};

export default PostCreateCommand;
