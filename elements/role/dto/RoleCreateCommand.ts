import EntityPermissionCreateCommand from "../../entityPermission/dto/EntityPermissionCreateCommand";
import { Permission } from "../role.model";

type RoleCreateCommand = {
  name: string;
  language: string;
  permissions: Permission[];
  entityPermissions: EntityPermissionCreateCommand[];
};

export default RoleCreateCommand;
