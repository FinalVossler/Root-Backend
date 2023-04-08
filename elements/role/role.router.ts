import { Router, Response } from "express";
import mongoose from "mongoose";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import PaginationResponse from "../../globalTypes/PaginationResponse";
import ResponseDto from "../../globalTypes/ResponseDto";
import protectMiddleware from "../../middleware/protectMiddleware";
import superAdminProtectMiddleware from "../../middleware/superAdminProtectMiddleware";
import { SuperRole } from "../user/user.model";
import RoleCreateCommand from "./dto/RoleCreateCommand";
import RoleReadDto, { toReadDto } from "./dto/RoleReadDto";
import RolesGetCommand from "./dto/RolesGetCommand";
import RolesSearchCommand from "./dto/RolesSearchCommand";
import RoleUpdateCommand from "./dto/RoleUpdateCommand";
import { IRole } from "./role.model";
import roleService from "./role.service";

const router = Router();

router.post(
  "/",
  protectMiddleware,
  superAdminProtectMiddleware,
  async (
    req: ConnectedRequest<any, any, RoleCreateCommand, any>,
    res: Response<ResponseDto<RoleReadDto>>
  ) => {
    const command: RoleCreateCommand = req.body;
    if (req.user.superRole !== SuperRole.SuperAdmin) {
      throw new Error("Unauthorized to create field");
    }
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
  superAdminProtectMiddleware,
  async (
    req: ConnectedRequest<any, any, RoleUpdateCommand, any>,
    res: Response<ResponseDto<RoleReadDto>>
  ) => {
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
  async (
    req: ConnectedRequest<any, any, RolesGetCommand, any>,
    res: Response<ResponseDto<PaginationResponse<RoleReadDto>>>
  ) => {
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
  superAdminProtectMiddleware,
  async (
    req: ConnectedRequest<any, any, mongoose.ObjectId[], any>,
    res: Response<ResponseDto<void>>
  ) => {
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
  async (
    req: ConnectedRequest<any, any, RolesSearchCommand, any>,
    res: Response<ResponseDto<PaginationResponse<RoleReadDto>>>
  ) => {
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
