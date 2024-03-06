import {
  IEntityFieldPermissionReadDto,
  IEntityPermissionReadDto,
  IEntityUserAssignmentPermissionsByRoleReadDto,
} from "roottypes";

import { entityEventNotificationToReadDto } from "../../entityEventNotification/ports/entityEventNotification.toReadDto";
import { fieldToReadDto } from "../../field/ports/field.toReadDto";
import { roleToReadDto } from "../../role/ports/role.toReadDto";
import { modelToReadDto } from "../../model/ports/model.toReadDto";
import IEntityPermission, {
  IEntityUserAssignmentPermissionsByRole,
  IFieldPermission,
} from "./interfaces/IEntityPermission";

export const entityPermissionToReadDto = (
  entityPermission: IEntityPermission | string
): IEntityPermissionReadDto | string => {
  if (
    typeof entityPermission === "string" ||
    entityPermission.toString() !== "[object Object]"
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
  entityFieldPermission: IFieldPermission
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
