import mongoose from "mongoose";

import { IUser } from "../user/adapters/user.mongoose.model";
import File, { IFile } from "./file.model";
import {
  IFileCommand,
  IFileGetUnownedAndSelectedFilesCommand,
  IFileGetUserAndSelectedFilesCommand,
} from "roottypes";

const fileRepository = {
  getUserFiles: async (
    user: IUser,
    command: IFileGetUserAndSelectedFilesCommand
  ): Promise<{ files: IFile[]; total: number }> => {
    const files: IFile[] = await File.find({ ownerId: user._id })
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit);

    const total: number = await File.find({ ownerId: user._id }).count();

    const selectedFiles: IFile[] = await File.find({
      _id: {
        $in: command.selectedFilesIds.filter((fieldId) => Boolean(fieldId)),
      },
    });

    selectedFiles.forEach((file) => {
      if (!files.find((f) => f._id === file._id)) {
        files.unshift(file);
      }
    });

    return { files, total };
  },
  getUnownedFiles: async (
    command: IFileGetUnownedAndSelectedFilesCommand
  ): Promise<{ files: IFile[]; total: number }> => {
    const files: IFile[] = await File.find({ ownerId: null })
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit);

    const total: number = await File.find({ ownerId: null }).count();

    const selectedFiles: IFile[] = await File.find({
      _id: {
        $in: command.selectedFilesIds.filter((fieldId) => Boolean(fieldId)),
      },
    });

    selectedFiles.forEach((file) => {
      if (!files.find((f) => f._id === file._id)) {
        files.unshift(file);
      }
    });

    return { files, total };
  },
  get: async (
    fileId: mongoose.Types.ObjectId | string
  ): Promise<IFile | null> => {
    const file: IFile | null = await File.findById(fileId);

    return file;
  },
  create: async (
    file: IFileCommand,
    currentUser: IUser | null = null
  ): Promise<IFile> => {
    if (file._id) {
      const existingFile: IFile | null = await fileRepository.get(file._id);
      if (existingFile) {
        return existingFile;
      }
    }

    file.ownerId = currentUser ? currentUser?._id.toString() : undefined;

    // In case the file that was passed has an id, but isn't found in the database
    if (file._id) {
      delete file._id;
    }
    const newFile: IFile = (await File.create(file)) as IFile;

    return newFile;
  },
  createFiles: async (
    files: IFileCommand[],
    currentUser: IUser | null = null
  ): Promise<IFile[]> => {
    let createdFiles: IFile[] = [];
    if (files && files.length > 0) {
      const promises: Promise<IFile>[] = files.map((file) =>
        fileRepository.create(file, currentUser)
      );

      await Promise.all(promises).then((files: IFile[]) => {
        createdFiles = [...files];
      });
    }

    return createdFiles;
  },
  deleteUserFiles: async (userId: string) => {
    await File.deleteMany({ ownerId: userId });
  },
};

export default fileRepository;
