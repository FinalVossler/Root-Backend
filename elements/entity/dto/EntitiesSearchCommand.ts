import PaginationCommand from "../../../globalTypes/PaginationCommand";

type EntitiesSearchCommand = {
  name: string;
  modelId: string;
  paginationCommand: PaginationCommand;
};

export default EntitiesSearchCommand;
