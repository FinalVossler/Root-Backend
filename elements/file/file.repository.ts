import mongoose from "mongoose";

import { IUser } from "../user/user.model";
import FileGetUnownedAndSelectedFilesCommand from "./dto/FileGetUnownedAndSelectedFilesCommand";
import FileGetUserAndSelectedFilesCommand from "./dto/FileGetUserAndSelectedFilesCommand";
import File, { IFile } from "./file.model";

const fileRepository = {
  getUserFiles: async (
    user: IUser,
    command: FileGetUserAndSelectedFilesCommand
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
    command: FileGetUnownedAndSelectedFilesCommand
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
  get: async (fileId: mongoose.ObjectId | string): Promise<IFile> => {
    const file: IFile = await File.findById(fileId);

    return file;
  },
  create: async (file: IFile, currentUser: IUser = null): Promise<IFile> => {
    if (file._id) {
      return await fileRepository.get(file._id);
    }
    file.ownerId = currentUser ? currentUser?._id : null;
    const newFile: IFile = (await File.create(file)) as IFile;

    return newFile;
  },
  createFiles: async (
    files: IFile[],
    currentUser: IUser = null
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
