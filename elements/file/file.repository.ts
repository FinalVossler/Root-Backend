import mongoose from "mongoose";

import PaginationCommand from "../../globalTypes/PaginationCommand";
import { IUser } from "../user/user.model";
import File, { IFile } from "./file.model";

const fileRepository = {
  getUserFiles: async (
    user: IUser,
    paginationCommand: PaginationCommand
  ): Promise<IFile[]> => {
    const files: IFile[] = await File.find({ ownerId: user._id })
      .skip((paginationCommand.page - 1) * paginationCommand.limit)
      .limit(paginationCommand.limit);

    return files;
  },
  get: async (fileId: mongoose.ObjectId | string): Promise<IFile> => {
    const file: IFile = await File.findById(fileId);

    return file;
  },
  create: async (file: IFile, currentUser: IUser): Promise<IFile> => {
    if (file._id) {
      return await fileRepository.get(file._id);
    }
    file.ownerId = currentUser._id;
    const newFile: IFile = (await File.create(file)) as IFile;

    return newFile;
  },
  createFiles: async (files: IFile[], currentUser: IUser): Promise<IFile[]> => {
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
};

export default fileRepository;
