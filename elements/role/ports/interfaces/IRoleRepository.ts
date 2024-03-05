import {
  IEntityPermissionCreateCommand,
  IEntityPermissionUpdateCommand,
  IRoleCreateCommand,
  IRoleUpdateCommand,
  IRolesGetCommand,
  IRolesSearchCommand,
} from "roottypes";
import IRole from "./IRole";
import IEntityPermission from "../../../entityPermission/ports/interfaces/IEntityPermission";

interface IRoleRepository {
  createEntityPermissions: (
    command: IEntityPermissionCreateCommand[]
  ) => Promise<IEntityPermission[]>;
  updateEntityPermissions: (
    commands: (IEntityPermissionUpdateCommand | undefined)[],
    oldEntityPermissions: IEntityPermission[]
  ) => Promise<IEntityPermission[]>;
  create: (command: IRoleCreateCommand) => Promise<IRole>;
  update: (command: IRoleUpdateCommand) => Promise<IRole>;
  getRoles: (
    command: IRolesGetCommand
  ) => Promise<{ total: number; roles: IRole[] }>;
  deleteRoles: (rolesIds: string[]) => Promise<null>;
  search: (
    command: IRolesSearchCommand
  ) => Promise<{ roles: IRole[]; total: number }>;
  getRolesWithEntityPermissions: (
    entityPermissionsIds: string[]
  ) => Promise<IRole[]>;
}

export default IRoleRepository;
