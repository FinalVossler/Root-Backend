import PaginationCommand from "../../../globalTypes/PaginationCommand";

type FileGetUserAndSelectedFilesCommand = {
  paginationCommand: PaginationCommand;
  selectedFilesIds: string[];
};

export default FileGetUserAndSelectedFilesCommand;
