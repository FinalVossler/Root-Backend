import { IFile } from "../elements/file/file.model";
import fileRepository from "../elements/file/file.repository";

const createFiles = async (files: IFile[]): Promise<IFile[]> => {
  let createdFiles: IFile[] = [];
  if (files.length > 0) {
    const promises: Promise<IFile>[] = files.map((file) =>
      fileRepository.create(file)
    );

    await Promise.all(promises).then((files: IFile[]) => {
      createdFiles = [...files];
    });

    return createdFiles;
  }
};

export default createFiles;
