import { StaticPermission } from "../entityPermission.model";

type EntityPermissionUpdateCommand = {
  modelId: string;
  permissions: StaticPermission[];
  fieldPermissions: {
    fieldId: string;
    permissions: StaticPermission[];
  }[];
};

export default EntityPermissionUpdateCommand;
