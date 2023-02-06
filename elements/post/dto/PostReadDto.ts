import { IPost } from "../post.model";

type PostReadDto = {
  _id: IPost["_id"];
  title?: IPost["title"];
  posterId: IPost["posterId"];
  content?: IPost["content"];
  files: IPost["files"];

  createdAt: IPost["createdAt"];
  updatedAt: IPost["updatedAt"];
};

export const toReadDto = (post: IPost): PostReadDto => {
  return {
    _id: post._id,
    title: post.title,
    posterId: post.posterId,
    content: post.content,
    files: post.files,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
};

export default PostReadDto;
