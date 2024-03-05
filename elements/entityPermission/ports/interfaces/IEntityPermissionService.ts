import IEntityPermission from "./IEntityPermission";

interface IEntityPermissionService {
  getModelEntityPermissions: (modelId: string) => Promise<IEntityPermission[]>;
}

export default IEntityPermissionService;
