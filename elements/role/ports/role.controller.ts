import { Response } from "express";

import IConnectedRequest from "../../../globalTypes/IConnectedRequest";
import IPaginationResponse from "../../../globalTypes/IPaginationResponse";
import IResponseDto from "../../../globalTypes/IResponseDto";
import {
  IRoleCreateCommand,
  IRoleReadDto,
  IRoleUpdateCommand,
  IRolesGetCommand,
  IRolesSearchCommand,
} from "roottypes";
import { roleToReadDto } from "./role.toReadDto";
import IRole from "./interfaces/IRole";
import IRoleService from "./interfaces/IRoleService";

const createRoleController = (roleService: IRoleService) => ({
  createRole: async (
    req: IConnectedRequest<any, any, IRoleCreateCommand, any>,
    res: Response<IResponseDto<IRoleReadDto>>
  ) => {
    const field: IRole = await roleService.createRole(req.body, req.user);

    return res.status(200).send({
      success: true,
      data: roleToReadDto(field) as IRoleReadDto,
    });
  },
  updateRole: async (
    req: IConnectedRequest<any, any, IRoleUpdateCommand, any>,
    res: Response<IResponseDto<IRoleReadDto>>
  ) => {
    const role: IRole = await roleService.updateRole(req.body, req.user);

    return res.status(200).send({
      success: true,
      data: roleToReadDto(role) as IRoleReadDto,
    });
  },
  getRoles: async (
    req: IConnectedRequest<any, any, IRolesGetCommand, any>,
    res: Response<IResponseDto<IPaginationResponse<IRoleReadDto>>>
  ) => {
    const command: IRolesGetCommand = req.body;
    const { roles, total } = await roleService.getRoles(command, req.user);

    return res.status(200).send({
      success: true,
      data: {
        data: roles.map((p) => roleToReadDto(p) as IRoleReadDto),
        total,
      },
    });
  },
  deleteRoles: async (
    req: IConnectedRequest<any, any, string[], any>,
    res: Response<IResponseDto<void>>
  ) => {
    await roleService.deleteRoles(req.body, req.user);

    return res.status(200).send({
      success: true,
      data: null,
    });
  },
  searchRoles: async (
    req: IConnectedRequest<any, any, IRolesSearchCommand, any>,
    res: Response<IResponseDto<IPaginationResponse<IRoleReadDto>>>
  ) => {
    const command: IRolesSearchCommand = req.body;

    const { roles, total } = await roleService.searchRoles(command, req.user);

    return res.status(200).send({
      success: true,
      data: {
        data: roles.map((p) => roleToReadDto(p) as IRoleReadDto),
        total,
      },
    });
  },
});

export default createRoleController;
