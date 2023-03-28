import PaginationCommand from "../../../globalTypes/PaginationCommand";

type FileGetUnownedAndSelectedFilesCommand = {
  paginationCommand: PaginationCommand;
  selectedFilesIds: string[];
};

export default FileGetUnownedAndSelectedFilesCommand;
