import { IRoleReadDto } from "roottypes";

import { entityPermissionToReadDto } from "../../entityPermission/ports/entityPermission.toReadDto";
import IRole from "./interfaces/IRole";

export const roleToReadDto = (role: IRole | string): IRoleReadDto | string => {
  if (typeof role === "string" || Object.keys(role).length === 0) {
    return role.toString();
  }

  return {
    _id: role._id.toString(),
    name: role.name,
    permissions: role.permissions,
    entityPermissions: role.entityPermissions.map((ep) =>
      entityPermissionToReadDto(ep)
    ),
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
};
