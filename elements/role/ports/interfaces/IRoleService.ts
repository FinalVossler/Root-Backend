import {
  IRoleCreateCommand,
  IRoleUpdateCommand,
  IRolesGetCommand,
  IRolesSearchCommand,
  PermissionEnum,
  StaticPermissionEnum,
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
  checkEntityPermission: (command: {
    user: IUser;
    modelId: string;
    staticPermission: StaticPermissionEnum;
  }) => boolean;
  checkPermission: (command: {
    user?: IUser;
    permission: PermissionEnum;
  }) => boolean;
  getRolesWithEntityPermissionsForModel: (modelId: string) => Promise<IRole[]>;
}
