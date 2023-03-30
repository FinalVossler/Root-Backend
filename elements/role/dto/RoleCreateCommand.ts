import { IRole } from "../role.model";

type RoleCreateCommand = {
  name: string;
  language: string;
};

export default RoleCreateCommand;
