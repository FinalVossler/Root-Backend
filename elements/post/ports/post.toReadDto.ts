import { IPostReadDto } from "roottypes";

import { fileToReadDto } from "../../file/ports/file.toReadDto";
import { userToReadDto } from "../../user/ports/user.toReadDto";
import IPost from "./interfaces/IPost";

export const postToReadDto = (post: IPost | string): IPostReadDto | string => {
  if (typeof post === "string" || post.toString() !== "[object Object]") {
    return post.toString();
  }

  return {
    _id: post._id.toString(),
    title: post.title,
    subTitle: post.subTitle,
    poster: userToReadDto(post.poster),
    content: post.content,
    files: post.files.map((f) => fileToReadDto(f)),
    design: post.design,
    children: post.children.map((p) => postToReadDto(p)),
    code: post.code,
    visibility: post.visibility,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
};
