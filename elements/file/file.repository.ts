import File, { IFile } from "./file.model";

const fileRepository = {
  create: async (file: IFile): Promise<IFile> => {
    const newFile: IFile = (await File.create(file)) as IFile;

    return newFile;
  },
  createFiles: async (files: IFile[]): Promise<IFile[]> => {
    let createdFiles: IFile[] = [];
    if (files && files.length > 0) {
      const promises: Promise<IFile>[] = files.map((file) =>
        fileRepository.create(file)
      );

      await Promise.all(promises).then((files: IFile[]) => {
        createdFiles = [...files];
      });
    }

    return createdFiles;
  },
};

export default fileRepository;
