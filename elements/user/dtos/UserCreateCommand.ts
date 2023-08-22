import { SuperRole } from "../user.model";

export type UserCreateCommand = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleId?: string;
  superRole: SuperRole;
};

export default UserCreateCommand;
