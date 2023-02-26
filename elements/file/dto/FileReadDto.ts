import { IFile } from "../file.model";

export type FileReadDto = {
  _id?: IFile["_id"];
  url: IFile["url"];
  uuid: IFile["uuid"];
  isImage: IFile["isImage"];
  name?: IFile["name"];
  ownerId?: IFile["ownerId"];
};

export const toReadDto = (file: IFile): FileReadDto => {
  return {
    _id: file._id,
    url: file.url,
    uuid: file.uuid,
    isImage: file.isImage,
    name: file.name,
    ownerId: file.ownerId,
  };
};
