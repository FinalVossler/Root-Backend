import { IEntityPermission } from "./entityPermission.model";
import entityPermissionRepository from "./entityPermission.repository";

const entityPermissionSerivce = {
  getModelEntityPermissions: async (
    modelId: string
  ): Promise<IEntityPermission[]> => {
    return await entityPermissionRepository.getModelEntityPermissions(modelId);
  },
};

export default entityPermissionSerivce;
