import EntityPermissionUpdateCommand from "../../entityPermission/dto/EntityPermissionUpdateCommand";
import { Permission } from "../role.model";

type RoleUpdateCommand = {
  _id: string;
  name: string;
  language: string;
  permissions: Permission[];

  entityPermissions: EntityPermissionUpdateCommand[];
};

export default RoleUpdateCommand;
