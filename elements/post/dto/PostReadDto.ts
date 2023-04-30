import { IPost } from "../post.model";

type PostReadDto = {
  _id: IPost["_id"];
  title?: IPost["title"];
  subTitle?: IPost["subTitle"];
  posterId: IPost["posterId"];
  content?: IPost["content"];
  files: IPost["files"];
  design: IPost["design"];
  children: IPost["children"];
  code: IPost["code"];

  createdAt: IPost["createdAt"];
  updatedAt: IPost["updatedAt"];
};

export const toReadDto = (post: IPost): PostReadDto => {
  return {
    _id: post._id,
    title: post.title,
    subTitle: post.subTitle,
    posterId: post.posterId,
    content: post.content,
    files: post.files,
    design: post.design,
    children: post.children,
    code: post.code,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
};

export default PostReadDto;
