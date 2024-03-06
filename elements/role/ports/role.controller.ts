import {
  IRoleCreateCommand,
  IRoleReadDto,
  IRoleUpdateCommand,
  IRolesGetCommand,
  IRolesSearchCommand,
} from "roottypes";

import IRequest from "../../../globalTypes/IRequest";
import { roleToReadDto } from "./role.toReadDto";
import IRole from "./interfaces/IRole";
import IRoleService from "./interfaces/IRoleService";
import IRoleController from "./interfaces/IRoleController";
import IUser from "../../user/ports/interfaces/IUser";

const createRoleController = (roleService: IRoleService): IRoleController => ({
  createRole: async (req: IRequest<IRoleCreateCommand>, currentUser: IUser) => {
    const field: IRole = await roleService.createRole(req.body, currentUser);

    return {
      success: true,
      data: roleToReadDto(field) as IRoleReadDto,
    };
  },
  updateRole: async (req: IRequest<IRoleUpdateCommand>, currentUser: IUser) => {
    const role: IRole = await roleService.updateRole(req.body, currentUser);

    return {
      success: true,
      data: roleToReadDto(role) as IRoleReadDto,
    };
  },
  getRoles: async (req: IRequest<IRolesGetCommand>, currentUser: IUser) => {
    const command: IRolesGetCommand = req.body;
    const { roles, total } = await roleService.getRoles(command, currentUser);

    return {
      success: true,
      data: {
        data: roles.map((p) => roleToReadDto(p) as IRoleReadDto),
        total,
      },
    };
  },
  deleteRoles: async (req: IRequest<string[]>, currentUser: IUser) => {
    await roleService.deleteRoles(req.body, currentUser);

    return {
      success: true,
      data: null,
    };
  },
  searchRoles: async (
    req: IRequest<IRolesSearchCommand>,
    currentUser: IUser
  ) => {
    const command: IRolesSearchCommand = req.body;

    const { roles, total } = await roleService.searchRoles(
      command,
      currentUser
    );

    return {
      success: true,
      data: {
        data: roles.map((p) => roleToReadDto(p) as IRoleReadDto),
        total,
      },
    };
  },
});

export default createRoleController;
