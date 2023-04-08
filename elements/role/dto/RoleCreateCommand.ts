import { Permission } from "../role.model";

type RoleCreateCommand = {
  name: string;
  language: string;
  permissions: Permission[];
};

export default RoleCreateCommand;
