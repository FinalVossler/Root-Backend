import { IPost } from "../post.model";

type PostReadDto = {
  title?: IPost["title"];
  poster: IPost["poster"];
  content: IPost["content"];
  files: IPost["files"];

  createdAt: IPost["createdAt"];
  updatedAt: IPost["updatedAt"];
};

export const toReadDto = (post: IPost): PostReadDto => {
  return {
    title: post.title,
    poster: post.poster,
    content: post.content,
    files: post.files,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
};

export default PostReadDto;
