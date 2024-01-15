import { IRoleReadDto } from "roottypes";
import { IRole } from "./role.model";
import { entityPermissionToReadDto } from "../entityPermission/entityPermission.toReadDto";
import mongoose from "mongoose";

export const roleToReadDto = (role: IRole | string): IRoleReadDto | string => {
  if (
    typeof role === "string" ||
    mongoose.Types.ObjectId.isValid(role.toString())
  ) {
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
