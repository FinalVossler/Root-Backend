import {
  IFileGetUnownedAndSelectedFilesCommand,
  IFileGetUserAndSelectedFilesCommand,
} from "roottypes";

import IFileRepository from "./interfaces/IFileRepository";
import IUser from "../../user/ports/interfaces/IUser";
import IFile from "./interfaces/IFile";

const createFileService = (fileRepository: IFileRepository) => ({
  getUserFiles: async (
    user: IUser,
    command: IFileGetUserAndSelectedFilesCommand
  ): Promise<{ files: IFile[]; total: number }> => {
    const { files, total } = await fileRepository.getUserFiles(user, command);

    return { files, total };
  },
  getUnownedFiles: async (
    command: IFileGetUnownedAndSelectedFilesCommand
  ): Promise<{ files: IFile[]; total: number }> => {
    const { files, total } = await fileRepository.getUnownedFiles(command);

    return { files, total };
  },
  deleteUsersFiles: async (usersIds: string[]) => {
    return await fileRepository.deleteUsersFiles(usersIds);
  },
});

export default createFileService;
