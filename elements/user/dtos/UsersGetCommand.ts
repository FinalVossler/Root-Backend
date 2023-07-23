import PaginationCommand from "../../../globalTypes/PaginationCommand";

type UsersGetCommand = {
  paginationCommand: PaginationCommand;
  roleId?: string;
};

export default UsersGetCommand;
