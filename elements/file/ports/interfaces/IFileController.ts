import {
  IFileGetUnownedAndSelectedFilesCommand,
  IFileGetUserAndSelectedFilesCommand,
  IFileReadDto,
} from "roottypes";

import IRequest from "../../../../globalTypes/IRequest";
import IResponseDto from "../../../../globalTypes/IResponseDto";
import IUser from "../../../user/ports/interfaces/IUser";

type IFileController = {
  getUserAndSelectedFiles: (
    req: IRequest<IFileGetUserAndSelectedFilesCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<{ files: IFileReadDto[]; total: number }>>;
  getUnOwnedAndSelectedFiles: (
    req: IRequest<IFileGetUnownedAndSelectedFilesCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<{ files: IFileReadDto[]; total: number }>>;
};

export default IFileController;
