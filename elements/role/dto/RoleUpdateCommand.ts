import { StaticPermission } from "../../entityPermission/entityPermission.model";
import { Permission } from "../role.model";

type RoleUpdateCommand = {
  _id: string;
  name: string;
  language: string;
  permissions: Permission[];

  entityPermissions: {
    modelId: string;
    permissions: StaticPermission[];
  }[];
};

export default RoleUpdateCommand;
