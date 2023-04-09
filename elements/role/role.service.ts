import mongoose from "mongoose";
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
  deleteRoles: async (rolesIds: mongoose.ObjectId[]): Promise<void> => {
    await roleRepository.deleteRoles(rolesIds);
  },

  search: async (
    command: RolesSearchCommand
  ): Promise<{ roles: IRole[]; total: number }> => {
    const { roles, total } = await roleRepository.search(command);

    return { roles, total };
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
};

export default roleService;
