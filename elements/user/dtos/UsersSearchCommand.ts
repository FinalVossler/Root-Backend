import PaginationCommand from "../../../globalTypes/PaginationCommand";

type UsersSearchCommand = {
  firstNameOrLastNameOrEmail: string;
  paginationCommand: PaginationCommand;
};

export default UsersSearchCommand;
