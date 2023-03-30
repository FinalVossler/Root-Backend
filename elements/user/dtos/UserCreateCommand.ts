export type UserCreateCommand = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleId?: string;
};

export default UserCreateCommand;
