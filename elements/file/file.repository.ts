import File, { IFile } from "./file.model";

const fileRepository = {
  create: async (file: IFile): Promise<IFile> => {
    const newFile: IFile = (await File.create(file)) as IFile;

    return newFile;
  },
};

export default fileRepository;
