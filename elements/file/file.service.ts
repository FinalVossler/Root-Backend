import PaginationCommand from "../../globalTypes/PaginationCommand";
import { IUser } from "../user/user.model";
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
};

export default fileService;
