import { Router, Response } from "express";
import mongoose from "mongoose";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import { IMicroFrontend } from "./microFrontend.model";
import PaginationResponse from "../../globalTypes/PaginationResponse";
import microFrontendService from "./microFrontend.service";
import { toReadDto } from "./dto/MicroFrontendReadDto";
import protectMiddleware from "../../middleware/protectMiddleware";
import roleService from "../role/role.service";
import { Permission } from "../role/role.model";
import MicroFrontendCreateCommand from "./dto/MicroFrontendCreateCommand";
import MicroFrontendReadDto from "./dto/MicroFrontendReadDto";
import MicroFrontendsGetCommand from "./dto/MicroFrontendsGetCommand";
import MicroFrontendsSearchCommand from "./dto/MicroFrontendsSearchCommand";
import MicroFrontendUpdateCommand from "./dto/MicroFrontendUpdateCommand";

const router = Router();

router.post(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, MicroFrontendCreateCommand, any>,
    res: Response<ResponseDto<MicroFrontendReadDto>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: Permission.CreateMicroFrontend,
    });

    const command: MicroFrontendCreateCommand = req.body;
    const microFrontend: IMicroFrontend =
      await microFrontendService.createMicroFrontend(command);

    return res.status(200).send({
      success: true,
      data: toReadDto(microFrontend),
    });
  }
);

router.put(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, MicroFrontendUpdateCommand, any>,
    res: Response<ResponseDto<MicroFrontendReadDto>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: Permission.UpdateMicroFrontend,
    });

    const command: MicroFrontendUpdateCommand = req.body;

    const microFrontend: IMicroFrontend =
      await microFrontendService.updateMicroFrontend(command);

    return res.status(200).send({
      success: true,
      data: toReadDto(microFrontend),
    });
  }
);

router.post(
  "/getMicroFrontends",
  async (
    req: ConnectedRequest<any, any, MicroFrontendsGetCommand, any>,
    res: Response<ResponseDto<PaginationResponse<MicroFrontendReadDto>>>
  ) => {
    const command: MicroFrontendsGetCommand = req.body;
    const { microFrontends, total } =
      await microFrontendService.getMicroFrontends(command);

    return res.status(200).send({
      success: true,
      data: {
        data: microFrontends.map((p) => toReadDto(p)),
        total,
      },
    });
  }
);

router.get(
  "/getById",
  async (
    req: ConnectedRequest<any, any, any, { microFrontendId: string }>,
    res: Response<ResponseDto<MicroFrontendReadDto>>
  ) => {
    const id: string = req.query.microFrontendId;
    const microFrontend: IMicroFrontend = await microFrontendService.getById(
      id
    );

    return res.status(200).send({
      success: true,
      data: toReadDto(microFrontend),
    });
  }
);

router.delete(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, mongoose.Types.ObjectId[], any>,
    res: Response<ResponseDto<void>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: Permission.DeleteMicroFrontend,
    });

    const microFrontendsIds: mongoose.Types.ObjectId[] = req.body;
    await microFrontendService.deleteMicroFrontends(microFrontendsIds);

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
    req: ConnectedRequest<any, any, MicroFrontendsSearchCommand, any>,
    res: Response<ResponseDto<PaginationResponse<MicroFrontendReadDto>>>
  ) => {
    const command: MicroFrontendsSearchCommand = req.body;

    const { microFrontends, total } = await microFrontendService.search(
      command
    );

    return res.status(200).send({
      success: true,
      data: {
        data: microFrontends.map((p) => toReadDto(p)),
        total,
      },
    });
  }
);

export default router;
