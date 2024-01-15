import { IPostReadDto } from "roottypes";
import { IPost } from "./post.model";
import { fileToReadDto } from "../file/file.toReadDto";
import { userToReadDto } from "../user/user.toReadDto";
import mongoose from "mongoose";

export const postToReadDto = (post: IPost | string): IPostReadDto | string => {
  if (
    typeof post === "string" ||
    mongoose.Types.ObjectId.isValid(post.toString())
  ) {
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
