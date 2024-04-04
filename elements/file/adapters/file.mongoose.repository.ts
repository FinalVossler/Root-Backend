import mongoose from "mongoose";

import File from "./file.mongoose.model";
import {
  IFileCommand,
  IFileGetUnownedAndSelectedFilesCommand,
  IFileGetUserAndSelectedFilesCommand,
} from "roottypes";
import IUser from "../../user/ports/interfaces/IUser";
import IFile from "../ports/interfaces/IFile";
import IFileRepository from "../ports/interfaces/IFileRepository";

const fileMongooseRepository: IFileRepository = {
  getUserFiles: async (
    user: IUser,
    command: IFileGetUserAndSelectedFilesCommand
  ): Promise<{ files: IFile[]; total: number }> => {
    const files: IFile[] = await File.find({ ownerId: user._id })
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .lean();

    const total: number = await File.find({ ownerId: user._id }).count();

    const selectedFiles = await File.find({
      _id: {
        $in: command.selectedFilesIds.filter((fieldId) => Boolean(fieldId)),
      },
    }).lean();

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
      .limit(command.paginationCommand.limit)
      .lean();

    const total: number = await File.find({ ownerId: null }).count();

    const selectedFiles: IFile[] = await File.find({
      _id: {
        $in: command.selectedFilesIds.filter((fieldId) => Boolean(fieldId)),
      },
    }).lean();

    selectedFiles.forEach((file) => {
      if (!files.find((f) => f._id === file._id)) {
        files.unshift(file);
      }
    });

    return { files, total };
  },
  get: async (fileId: mongoose.Types.ObjectId | string) => {
    const file = await File.findById(fileId).lean();

    return file;
  },
  create: async function (
    file: IFileCommand,
    currentUser: IUser | null = null
  ): Promise<IFile> {
    if (file._id) {
      const existingFile: IFile | null = await this.get(file._id);
      if (existingFile) {
        return existingFile;
      }
    }

    file.ownerId = currentUser ? currentUser?._id.toString() : undefined;

    // In case the file that was passed has an id, but isn't found in the database
    if (file._id) {
      delete file._id;
    }
    const newFile = (await File.create(file)).toObject();

    return newFile;
  },
  createFiles: async function (
    files: IFileCommand[],
    currentUser: IUser | null = null
  ): Promise<IFile[]> {
    let createdFiles: IFile[] = [];
    if (files && files.length > 0) {
      const promises: Promise<IFile>[] = files.map((file) =>
        this.create(file, currentUser)
      );

      await Promise.all(promises).then((files: IFile[]) => {
        createdFiles = [...files];
      });
    }

    return createdFiles;
  },
  deleteUsersFiles: async (usersIds: string[]) => {
    await File.deleteMany({
      ownerId: { $in: usersIds.map((id) => new mongoose.Types.ObjectId(id)) },
    });
  },
};

export default fileMongooseRepository;
