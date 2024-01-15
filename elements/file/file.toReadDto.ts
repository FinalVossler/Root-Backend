import { IFileReadDto } from "roottypes";
import { IFile } from "./file.model";
import mongoose from "mongoose";

export const fileToReadDto = (file: IFile | string): IFileReadDto | string => {
  if (
    typeof file === "string" ||
    mongoose.Types.ObjectId.isValid(file.toString())
  ) {
    return file.toString();
  }

  return {
    _id: file._id?.toString(),
    url: file.url,
    uuid: file.uuid,
    isImage: file.isImage,
    name: file.name,
    ownerId: file.ownerId?.toString(),
  };
};
