import { IUser } from "../user/user.model";
import File, { IFile } from "./file.model";

const fileRepository = {
  create: async (file: IFile, currentUser: IUser): Promise<IFile> => {
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
