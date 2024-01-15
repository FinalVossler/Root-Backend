import {
  IEntityFieldPermissionReadDto,
  IEntityPermissionReadDto,
  IEntityUserAssignmentPermissionsByRoleReadDto,
} from "roottypes";
import {
  IEntityPermission,
  IFieldPermission as IEntityFieldPermission,
  IEntityUserAssignmentPermissionsByRole,
} from "./entityPermission.model";
import { entityEventNotificationToReadDto } from "../entityEventNotification/entityEventNotification.toReadDto";
import { fieldToReadDto } from "../field/field.toReadDto";
import { modelToReadDto } from "../model/modelToReadDto";
import { roleToReadDto } from "../role/role.toReadDto";
import mongoose from "mongoose";

export const entityPermissionToReadDto = (
  entityPermission: IEntityPermission | string
): IEntityPermissionReadDto | string => {
  if (
    typeof entityPermission === "string" ||
    mongoose.Types.ObjectId.isValid(entityPermission.toString())
  ) {
    return entityPermission.toString();
  }

  return {
    _id: entityPermission._id.toString(),
    entityEventNotifications: entityPermission.entityEventNotifications.map(
      (en) => entityEventNotificationToReadDto(en)
    ),
    entityFieldPermissions: entityPermission.entityFieldPermissions.map((ef) =>
      entityFieldPermissionToReadDto(ef)
    ),
    model: modelToReadDto(entityPermission.model),
    permissions: entityPermission.permissions,
    entityUserAssignmentPermissionsByRole:
      entityPermission.entityUserAssignmentPermissionsByRole
        ? entityUserAssignmentPermissionsByRoleToReadDto(
            entityPermission.entityUserAssignmentPermissionsByRole
          )
        : undefined,
  };
};

const entityFieldPermissionToReadDto = (
  entityFieldPermission: IEntityFieldPermission
): IEntityFieldPermissionReadDto => {
  return {
    field: fieldToReadDto(entityFieldPermission.field),
    permissions: entityFieldPermission.permissions,
  };
};

const entityUserAssignmentPermissionsByRoleToReadDto = (
  entityUserAssignmentPermissionsByRoleToReadDto: IEntityUserAssignmentPermissionsByRole
): IEntityUserAssignmentPermissionsByRoleReadDto => {
  return {
    canAssignToUserFromSameRole:
      entityUserAssignmentPermissionsByRoleToReadDto.canAssignToUserFromSameRole,

    otherRoles:
      entityUserAssignmentPermissionsByRoleToReadDto?.otherRoles.map((r) =>
        roleToReadDto(r)
      ) || [],
  };
};
