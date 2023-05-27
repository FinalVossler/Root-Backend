import PaginationCommand from "../../globalTypes/PaginationCommand";
import { IUser } from "../user/user.model";
import FileGetUnownedAndSelectedFilesCommand from "./dto/FileGetUnownedAndSelectedFilesCommand";
import FileGetUserAndSelectedFilesCommand from "./dto/FileGetUserAndSelectedFilesCommand";
import { IFile } from "./file.model";
import fileRepository from "./file.repository";

const fileService = {
  getUserFiles: async (
    user: IUser,
    command: FileGetUserAndSelectedFilesCommand
  ): Promise<{ files: IFile[]; total: number }> => {
    const { files, total } = await fileRepository.getUserFiles(user, command);

    return { files, total };
  },
  getUnownedFiles: async (
    command: FileGetUnownedAndSelectedFilesCommand
  ): Promise<{ files: IFile[]; total: number }> => {
    const { files, total } = await fileRepository.getUnownedFiles(command);

    return { files, total };
  },
};

export default fileService;
