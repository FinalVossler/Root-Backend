import {
  IFileGetUnownedAndSelectedFilesCommand,
  IFileGetUserAndSelectedFilesCommand,
} from "roottypes";
import { IUser } from "../user/adapters/user.mongoose.model";
import { IFile } from "./file.model";
import fileRepository from "./file.repository";

const fileService = {
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
};

export default fileService;
