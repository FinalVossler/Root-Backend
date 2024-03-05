import IEntityPermission from "./interfaces/IEntityPermission";
import IEntityPermissionRepository from "./interfaces/IEntityPermissionRepository";
import IEntityPermissionService from "./interfaces/IEntityPermissionService";

const createEntityPermissionService = (
  entityPermissionRepository: IEntityPermissionRepository
): IEntityPermissionService => ({
  getModelEntityPermissions: async (
    modelId: string
  ): Promise<IEntityPermission[]> => {
    return await entityPermissionRepository.getModelEntityPermissions(modelId);
  },
});

export default createEntityPermissionService;
