import PaginationCommand from "../../../globalTypes/PaginationCommand";

type UsersSearchCommand = {
  firstNameOrLastName: string;
  paginationCommand: PaginationCommand;
};

export default UsersSearchCommand;
