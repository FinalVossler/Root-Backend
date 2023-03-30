import { IRole } from "../role.model";

type RoleUpdateCommand = {
  _id: string;
  name: string;
  language: string;
};

export default RoleUpdateCommand;
