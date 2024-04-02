import {
  IRoleCreateCommand,
  IRoleUpdateCommand,
  IRolesGetCommand,
  IRolesSearchCommand,
  PermissionEnum,
  EntityStaticPermissionEnum,
} from "roottypes";

import IRole from "./IRole";
import IUser from "../../../user/ports/interfaces/IUser";

export default interface IRoleService {
  createRole: (
    command: IRoleCreateCommand,
    currentUser: IUser
  ) => Promise<IRole>;
  updateRole: (
    command: IRoleUpdateCommand,
    currentUser: IUser
  ) => Promise<IRole>;
  getRoles: (
    command: IRolesGetCommand,
    currentUser: IUser
  ) => Promise<{ roles: IRole[]; total: number }>;
  deleteRoles: (rolesIds: string[], currentUser: IUser) => Promise<void>;
  searchRoles: (
    command: IRolesSearchCommand,
    currentUser: IUser
  ) => Promise<{ roles: IRole[]; total: number }>;
  hasEntityPermission: (command: {
    user: IUser;
    modelId: string;
    staticPermission: EntityStaticPermissionEnum;
    entitiesOwners?: (IUser | string | undefined)[];
    ownerPermission?: EntityStaticPermissionEnum;
  }) => boolean;
  checkEntityPermission: (command: {
    user: IUser;
    modelId: string;
    staticPermission: EntityStaticPermissionEnum;
    entitiesOwners?: (IUser | string | undefined)[];
    ownerPermission?: EntityStaticPermissionEnum;
  }) => never | void;
  checkPermission: (command: {
    user?: IUser;
    permission: PermissionEnum;
    elementsOwners?: (string | IUser | undefined)[];
    ownerPermission?: PermissionEnum;
  }) => never | void;
  hasPermission: (command: {
    user?: IUser;
    permission: PermissionEnum;
    elementsOwners?: (string | IUser | undefined)[];
    ownerPermission?: PermissionEnum;
  }) => boolean;
  getRolesWithEntityPermissionsForModel: (modelId: string) => Promise<IRole[]>;
}
