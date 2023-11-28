import mongoose from "mongoose";
import {
  IEntityPermission,
  StaticPermission,
} from "../entityPermission/entityPermission.model";
import entityPermissionSerivce from "../entityPermission/entityPermission.service";
import { IUser, SuperRole } from "../user/user.model";

import RoleCreateCommand from "./dto/RoleCreateCommand";
import RolesGetCommand from "./dto/RolesGetCommand";
import RolesSearchCommand from "./dto/RolesSearchCommand";
import RoleUpdateCommand from "./dto/RoleUpdateCommand";
import { IRole, Permission } from "./role.model";
import roleRepository from "./role.repository";

const roleService = {
  createRole: async (command: RoleCreateCommand): Promise<IRole> => {
    const role: IRole = await roleRepository.create(command);

    return role;
  },
  updateRole: async (command: RoleUpdateCommand): Promise<IRole> => {
    const role: IRole = await roleRepository.update(command);

    return role;
  },
  getRoles: async (
    command: RolesGetCommand
  ): Promise<{ roles: IRole[]; total: number }> => {
    const { roles, total } = await roleRepository.getRoles(command);

    return { roles, total };
  },
  deleteRoles: async (rolesIds: mongoose.Types.ObjectId[]): Promise<void> => {
    await roleRepository.deleteRoles(rolesIds);
  },

  search: async (
    command: RolesSearchCommand
  ): Promise<{ roles: IRole[]; total: number }> => {
    const { roles, total } = await roleRepository.search(command);

    return { roles, total };
  },
  checkEntityPermission: ({
    user,
    modelId,
    staticPermission,
  }: {
    user: IUser;
    modelId: string;
    staticPermission: StaticPermission;
  }): boolean => {
    if (user.superRole === SuperRole.SuperAdmin) {
      return true;
    }

    const hasAccess: boolean = Boolean(
      user.role?.entityPermissions
        .find(
          (entityPermission: IEntityPermission) =>
            entityPermission.model._id.toString() === modelId
        )
        ?.permissions.find((p) => p === staticPermission)
    );

    if (!hasAccess) {
      throw new Error("Permission denied");
    }

    return hasAccess;
  },
  checkPermission: ({
    user,
    permission,
  }: {
    user?: IUser;
    permission: Permission;
  }): boolean => {
    if (!user) {
      throw new Error("Permission denied");
    }

    if (user.superRole === SuperRole.SuperAdmin) {
      return true;
    }

    if (
      !Boolean(
        user.role &&
          user.role.permissions &&
          user.role?.permissions.indexOf(permission) > -1
      )
    ) {
      throw new Error("Permission denied");
    }

    return true;
  },
  getRolesWithEntityPermissionsForModel: async (
    modelId: string
  ): Promise<IRole[]> => {
    const entityPermissions: IEntityPermission[] =
      await entityPermissionSerivce.getModelEntityPermissions(modelId);

    const roles: IRole[] = await roleRepository.getRolesWithEntityPermissions(
      entityPermissions.map((el) => el._id.toString())
    );
    return roles;
  },
};

export default roleService;
