import { EntityStaticPermissionEnum } from "roottypes";

import IModel from "../../../model/ports/interfaces/IModel";
import IEntityEventNotification from "../../../entityEventNotification/ports/interfaces/IEntityEventNotification";
import { IField } from "../../../field/ports/interfaces/IField";
import IRole from "../../../role/ports/interfaces/IRole";

export default interface IEntityPermission {
  _id: string;
  model: IModel | string;
  permissions: EntityStaticPermissionEnum[];
  entityFieldPermissions: IFieldPermission[];
  entityEventNotifications: IEntityEventNotification[];
  entityUserAssignmentPermissionsByRole?: IEntityUserAssignmentPermissionsByRole;
}

export interface IFieldPermission {
  field: IField | string;
  permissions: EntityStaticPermissionEnum[];
}

export interface IEntityUserAssignmentPermissionsByRole {
  canAssignToUserFromSameRole: boolean;
  otherRoles: (IRole | string)[];
}
