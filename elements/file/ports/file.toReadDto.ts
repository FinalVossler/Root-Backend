import { IFileReadDto } from "roottypes";

import IFile from "./interfaces/IFile";

export const fileToReadDto = (file: IFile | string): IFileReadDto | string => {
  if (typeof file === "string" || Object.keys(file).length === 0) {
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
