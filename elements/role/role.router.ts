import { Router, Response } from "express";
import mongoose from "mongoose";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import PaginationResponse from "../../globalTypes/PaginationResponse";
import ResponseDto from "../../globalTypes/ResponseDto";
import protectMiddleware from "../../middleware/protectMiddleware";
import RoleCreateCommand from "./dto/RoleCreateCommand";
import RoleReadDto, { toReadDto } from "./dto/RoleReadDto";
import RolesGetCommand from "./dto/RolesGetCommand";
import RolesSearchCommand from "./dto/RolesSearchCommand";
import RoleUpdateCommand from "./dto/RoleUpdateCommand";
import { IRole, Permission } from "./role.model";
import roleService from "./role.service";

const router = Router();

router.post(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, RoleCreateCommand, any>,
    res: Response<ResponseDto<RoleReadDto>>
  ) => {
    const command: RoleCreateCommand = req.body;
    roleService.checkPermission({
      user: req.user,
      permission: Permission.CreateRole,
    });

    const field: IRole = await roleService.createRole(command);

    return res.status(200).send({
      success: true,
      data: toReadDto(field),
    });
  }
);

router.put(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, RoleUpdateCommand, any>,
    res: Response<ResponseDto<RoleReadDto>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: Permission.UpdateRole,
    });

    const command: RoleUpdateCommand = req.body;

    const role: IRole = await roleService.updateRole(command);

    return res.status(200).send({
      success: true,
      data: toReadDto(role),
    });
  }
);

router.post(
  "/getRoles",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, RolesGetCommand, any>,
    res: Response<ResponseDto<PaginationResponse<RoleReadDto>>>
  ) => {
    // Code commented. Roles should always be activated. We need to get the roles when assigning entities to users by roles
    // roleService.checkPermission({
    //   user: req.user,
    //   permission: Permission.ReadRole,
    // });

    const command: RolesGetCommand = req.body;
    const { roles, total } = await roleService.getRoles(command);

    return res.status(200).send({
      success: true,
      data: {
        data: roles.map((p) => toReadDto(p)),
        total,
      },
    });
  }
);

router.delete(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, mongoose.ObjectId[], any>,
    res: Response<ResponseDto<void>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: Permission.DeleteRole,
    });

    const rolesIds: mongoose.ObjectId[] = req.body;
    await roleService.deleteRoles(rolesIds);

    return res.status(200).send({
      success: true,
      data: null,
    });
  }
);

router.post(
  "/search",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, RolesSearchCommand, any>,
    res: Response<ResponseDto<PaginationResponse<RoleReadDto>>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: Permission.ReadRole,
    });

    const command: RolesSearchCommand = req.body;

    const { roles, total } = await roleService.search(command);

    return res.status(200).send({
      success: true,
      data: {
        data: roles.map((p) => toReadDto(p)),
        total,
      },
    });
  }
);

export default router;
