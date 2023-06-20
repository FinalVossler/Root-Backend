import UsersSearchCommand from "./UsersSearchCommand";

type UserSearchByRoleCommand = {
  searchCommand: UsersSearchCommand;
  roleId: string;
};

export default UserSearchByRoleCommand;
