import {
  IFileCommand,
  IFileGetUnownedAndSelectedFilesCommand,
  IFileGetUserAndSelectedFilesCommand,
} from "roottypes";
import IUser from "../../../user/ports/interfaces/IUser";
import IFile from "./IFile";

interface IFileRepository {
  getUserFiles: (
    user: IUser,
    command: IFileGetUserAndSelectedFilesCommand
  ) => Promise<{ files: IFile[]; total: number }>;
  getUnownedFiles: (
    command: IFileGetUnownedAndSelectedFilesCommand
  ) => Promise<{ files: IFile[]; total: number }>;
  get: (fileId: string) => Promise<IFile | null>;
  create: (file: IFileCommand, currentUser?: IUser) => Promise<IFile>;
  createFiles: (files: IFileCommand[], currentUser?: IUser) => Promise<IFile[]>;
  deleteUserFiles: (userId: string) => Promise<void>;
}

export default IFileRepository;
