import PaginationCommand from "../../globalTypes/PaginationCommand";
import { IUser } from "../user/user.model";
import { IFile } from "./file.model";
import fileRepository from "./file.repository";

const fileService = {
  getUserFiles: async (
    user: IUser,
    paginationCommand: PaginationCommand
  ): Promise<IFile[]> => {
    const files: IFile[] = await fileRepository.getUserFiles(
      user,
      paginationCommand
    );

    return files;
  },
};

export default fileService;
