import { StaticPermission } from "../entityPermission.model";

type EntityPermissionCreateCommand = {
  modelId: string;
  permissions: StaticPermission[];
};

export default EntityPermissionCreateCommand;
