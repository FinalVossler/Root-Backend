import {
  IFileGetUnownedAndSelectedFilesCommand,
  IFileGetUserAndSelectedFilesCommand,
} from "roottypes";

import IUser from "../../../user/ports/interfaces/IUser";
import IFile from "./IFile";

interface IFileService {
  getUserFiles: (
    user: IUser,
    command: IFileGetUserAndSelectedFilesCommand
  ) => Promise<{ files: IFile[]; total: number }>;
  getUnownedFiles: (
    command: IFileGetUnownedAndSelectedFilesCommand
  ) => Promise<{ files: IFile[]; total: number }>;
  deleteUsersFiles: (usersIds: string[]) => Promise<void>;
}

export default IFileService;
