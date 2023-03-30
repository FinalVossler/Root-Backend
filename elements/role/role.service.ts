import mongoose from "mongoose";

import RoleCreateCommand from "./dto/RoleCreateCommand";
import RolesGetCommand from "./dto/RolesGetCommand";
import RolesSearchCommand from "./dto/RolesSearchCommand";
import RoleUpdateCommand from "./dto/RoleUpdateCommand";
import { IRole } from "./role.model";
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
};

export default roleService;
