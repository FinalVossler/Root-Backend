import { IPost } from "../post.model";

type PostUpdateCommand = {
  _id: string;
  title?: string;
  subTitle?: string;
  content?: string;
  files: IPost["files"];
  visibility: IPost["visibility"];
  design: IPost["design"];
  children: IPost["children"];
  language: string;
  code?: string;
};

export default PostUpdateCommand;
