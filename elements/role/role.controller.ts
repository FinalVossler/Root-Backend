import { Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import PaginationResponse from "../../globalTypes/PaginationResponse";
import ResponseDto from "../../globalTypes/ResponseDto";
import roleService from "./role.service";
import {
  IRoleCreateCommand,
  IRoleReadDto,
  IRoleUpdateCommand,
  IRolesGetCommand,
  IRolesSearchCommand,
  PermissionEnum,
} from "roottypes";
import { IRole } from "./role.model";
import { roleToReadDto } from "./role.toReadDto";

const roleController = {
  createRole: async (
    req: ConnectedRequest<any, any, IRoleCreateCommand, any>,
    res: Response<ResponseDto<IRoleReadDto>>
  ) => {
    const command: IRoleCreateCommand = req.body;
    roleService.checkPermission({
      user: req.user,
      permission: PermissionEnum.CreateRole,
    });

    const field: IRole = await roleService.createRole(command);

    return res.status(200).send({
      success: true,
      data: roleToReadDto(field) as IRoleReadDto,
    });
  },
  updateRole: async (
    req: ConnectedRequest<any, any, IRoleUpdateCommand, any>,
    res: Response<ResponseDto<IRoleReadDto>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: PermissionEnum.UpdateRole,
    });

    const command: IRoleUpdateCommand = req.body;

    const role: IRole = await roleService.updateRole(command);

    return res.status(200).send({
      success: true,
      data: roleToReadDto(role) as IRoleReadDto,
    });
  },
  getRoles: async (
    req: ConnectedRequest<any, any, IRolesGetCommand, any>,
    res: Response<ResponseDto<PaginationResponse<IRoleReadDto>>>
  ) => {
    // Code commented. Roles should always be activated. We need to get the roles when assigning entities to users by roles
    // roleService.checkPermission({
    //   user: req.user,
    //   permission: Permission.ReadRole,
    // });

    const command: IRolesGetCommand = req.body;
    const { roles, total } = await roleService.getRoles(command);

    return res.status(200).send({
      success: true,
      data: {
        data: roles.map((p) => roleToReadDto(p) as IRoleReadDto),
        total,
      },
    });
  },
  deleteRoles: async (
    req: ConnectedRequest<any, any, string[], any>,
    res: Response<ResponseDto<void>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: PermissionEnum.DeleteRole,
    });

    const rolesIds: string[] = req.body;
    await roleService.deleteRoles(rolesIds);

    return res.status(200).send({
      success: true,
      data: null,
    });
  },
  searchRoles: async (
    req: ConnectedRequest<any, any, IRolesSearchCommand, any>,
    res: Response<ResponseDto<PaginationResponse<IRoleReadDto>>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: PermissionEnum.ReadRole,
    });

    const command: IRolesSearchCommand = req.body;

    const { roles, total } = await roleService.search(command);

    return res.status(200).send({
      success: true,
      data: {
        data: roles.map((p) => roleToReadDto(p) as IRoleReadDto),
        total,
      },
    });
  },
};

export default roleController;
