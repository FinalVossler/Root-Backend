import mongoose from "mongoose";
import { IEntityPermission } from "../entityPermission/entityPermission.model";
import entityPermissionSerivce from "../entityPermission/entityPermission.service";
import { IUser } from "../user/user.model";

import { IRole } from "./role.model";
import roleRepository from "./role.repository";
import {
  IRoleCreateCommand,
  IRoleUpdateCommand,
  IRolesGetCommand,
  IRolesSearchCommand,
  PermissionEnum,
  StaticPermissionEnum,
  SuperRoleEnum,
} from "roottypes";
import { IModel } from "../model/model.model";

const roleService = {
  createRole: async (command: IRoleCreateCommand): Promise<IRole> => {
    const role: IRole = await roleRepository.create(command);

    return role;
  },
  updateRole: async (command: IRoleUpdateCommand): Promise<IRole> => {
    const role: IRole = await roleRepository.update(command);

    return role;
  },
  getRoles: async (
    command: IRolesGetCommand
  ): Promise<{ roles: IRole[]; total: number }> => {
    const { roles, total } = await roleRepository.getRoles(command);

    return { roles, total };
  },
  deleteRoles: async (rolesIds: string[]): Promise<void> => {
    await roleRepository.deleteRoles(rolesIds);
  },

  search: async (
    command: IRolesSearchCommand
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
    staticPermission: StaticPermissionEnum;
  }): boolean => {
    if (user.superRole === SuperRoleEnum.SuperAdmin) {
      return true;
    }

    const hasAccess: boolean = Boolean(
      ((user.role as IRole)?.entityPermissions as IEntityPermission[])
        .find(
          (entityPermission: IEntityPermission) =>
            (entityPermission.model as IModel)._id.toString() === modelId
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
    permission: PermissionEnum;
  }): boolean => {
    if (!user) {
      throw new Error("Permission denied");
    }

    if (user.superRole === SuperRoleEnum.SuperAdmin) {
      return true;
    }

    if (
      !Boolean(
        user.role &&
          (user.role as IRole).permissions &&
          (user.role as IRole)?.permissions.indexOf(permission) > -1
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
