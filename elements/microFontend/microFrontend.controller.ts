import { Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import { IMicroFrontend } from "./microFrontend.model";
import PaginationResponse from "../../globalTypes/PaginationResponse";
import microFrontendService from "./microFrontend.service";
import roleService from "../role/role.service";
import {
  IMicroFrontendCreateCommand,
  IMicroFrontendReadDto,
  IMicroFrontendUpdateCommand,
  IMicroFrontendsGetCommand,
  IMicroFrontendsSearchCommand,
  PermissionEnum,
} from "roottypes";
import { microFrontendToReadDto } from "./microFrontend.toReadDto";

const microFrontendController = {
  createMicroFrontend: async (
    req: ConnectedRequest<any, any, IMicroFrontendCreateCommand, any>,
    res: Response<ResponseDto<IMicroFrontendReadDto>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: PermissionEnum.CreateMicroFrontend,
    });

    const command: IMicroFrontendCreateCommand = req.body;
    const microFrontend: IMicroFrontend =
      await microFrontendService.createMicroFrontend(command);

    return res.status(200).send({
      success: true,
      data: microFrontendToReadDto(microFrontend) as IMicroFrontendReadDto,
    });
  },
  updateMicroFrontend: async (
    req: ConnectedRequest<any, any, IMicroFrontendUpdateCommand, any>,
    res: Response<ResponseDto<IMicroFrontendReadDto>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: PermissionEnum.UpdateMicroFrontend,
    });

    const command: IMicroFrontendUpdateCommand = req.body;

    const microFrontend: IMicroFrontend =
      await microFrontendService.updateMicroFrontend(command);

    return res.status(200).send({
      success: true,
      data: microFrontendToReadDto(microFrontend) as IMicroFrontendReadDto,
    });
  },
  getMicroFrontends: async (
    req: ConnectedRequest<any, any, IMicroFrontendsGetCommand, any>,
    res: Response<ResponseDto<PaginationResponse<IMicroFrontendReadDto>>>
  ) => {
    const command: IMicroFrontendsGetCommand = req.body;
    const { microFrontends, total } =
      await microFrontendService.getMicroFrontends(command);

    return res.status(200).send({
      success: true,
      data: {
        data: microFrontends.map(
          (p) => microFrontendToReadDto(p) as IMicroFrontendReadDto
        ),
        total,
      },
    });
  },
  getById: async (
    req: ConnectedRequest<any, any, any, { microFrontendId: string }>,
    res: Response<ResponseDto<IMicroFrontendReadDto>>
  ) => {
    const id: string = req.query.microFrontendId;
    const microFrontend: IMicroFrontend = await microFrontendService.getById(
      id
    );

    return res.status(200).send({
      success: true,
      data: microFrontendToReadDto(microFrontend) as IMicroFrontendReadDto,
    });
  },
  deleteMicroFrontends: async (
    req: ConnectedRequest<any, any, string[], any>,
    res: Response<ResponseDto<void>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: PermissionEnum.DeleteMicroFrontend,
    });

    const microFrontendsIds: string[] = req.body;
    await microFrontendService.deleteMicroFrontends(microFrontendsIds);

    return res.status(200).send({
      success: true,
      data: null,
    });
  },
  searchMicroFrontends: async (
    req: ConnectedRequest<any, any, IMicroFrontendsSearchCommand, any>,
    res: Response<ResponseDto<PaginationResponse<IMicroFrontendReadDto>>>
  ) => {
    const command: IMicroFrontendsSearchCommand = req.body;

    const { microFrontends, total } = await microFrontendService.search(
      command
    );

    return res.status(200).send({
      success: true,
      data: {
        data: microFrontends.map(
          (p) => microFrontendToReadDto(p) as IMicroFrontendReadDto
        ),
        total,
      },
    });
  },
};

export default microFrontendController;
