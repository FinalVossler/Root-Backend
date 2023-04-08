import { Permission } from "../role.model";

type RoleUpdateCommand = {
  _id: string;
  name: string;
  language: string;
  permissions: Permission[];
};

export default RoleUpdateCommand;
