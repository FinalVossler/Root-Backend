import {
  IFileGetUnownedAndSelectedFilesCommand,
  IFileGetUserAndSelectedFilesCommand,
  IFileReadDto,
} from "roottypes";
import { fileToReadDto } from "./file.toReadDto";
import IFileService from "./interfaces/IFileService";
import IFileController from "./interfaces/IFileController";
import IRequest from "../../../globalTypes/IRequest";
import IUser from "../../user/ports/interfaces/IUser";

const createFileController = (fileService: IFileService): IFileController => ({
  getUserAndSelectedFiles: async (
    req: IRequest<IFileGetUserAndSelectedFilesCommand>,
    currentUser: IUser
  ) => {
    const { files, total } = await fileService.getUserFiles(
      currentUser,
      req.body
    );

    return {
      data: {
        files: files.map((file) => fileToReadDto(file) as IFileReadDto),
        total,
      },
      success: true,
    };
  },
  getUnOwnedAndSelectedFiles: async (
    req: IRequest<IFileGetUnownedAndSelectedFilesCommand>
  ) => {
    const { files, total } = await fileService.getUnownedFiles(req.body);

    return {
      data: {
        files: files.map((file) => fileToReadDto(file) as IFileReadDto),
        total,
      },
      success: true,
    };
  },
});

export default createFileController;
