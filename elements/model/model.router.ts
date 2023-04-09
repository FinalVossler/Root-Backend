import { Router, Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import { IModel } from "./model.model";
import PaginationResponse from "../../globalTypes/PaginationResponse";
import fieldService from "./model.service";
import protectMiddleware from "../../middleware/protectMiddleware";
import mongoose from "mongoose";
import ModelCreateCommand from "./dto/ModelCreateCommand";
import modelSerivce from "./model.service";
import ModelReadDto, { toReadDto } from "./dto/ModelReadDto";
import ModelUpdateCommand from "./dto/ModelUpdateCommand";
import ModelsGetCommand from "./dto/ModelsGetCommand";
import ModelsSearchCommand from "./dto/ModelsSearchCommand";
import roleService from "../role/role.service";
import { Permission } from "../role/role.model";

const router = Router();

router.post(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, ModelCreateCommand, any>,
    res: Response<ResponseDto<ModelReadDto>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: Permission.CreateModel,
    });

    const command: ModelCreateCommand = req.body;
    const model: IModel = await modelSerivce.createModel(command);

    return res.status(200).send({
      success: true,
      data: toReadDto(model),
    });
  }
);

router.put(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, ModelUpdateCommand, any>,
    res: Response<ResponseDto<ModelReadDto>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: Permission.UpdateModel,
    });

    const command: ModelUpdateCommand = req.body;
    const model: IModel = await modelSerivce.updateModel(command);

    return res.status(200).send({
      success: true,
      data: toReadDto(model),
    });
  }
);

router.post(
  "/getModels",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, ModelsGetCommand, any>,
    res: Response<ResponseDto<PaginationResponse<ModelReadDto>>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: Permission.ReadModel,
    });

    const command: ModelsGetCommand = req.body;
    const { models, total } = await fieldService.getModels(command);

    return res.status(200).send({
      success: true,
      data: {
        data: models.map((m) => toReadDto(m)),
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
      permission: Permission.DeleteModel,
    });

    const modelsIds: mongoose.ObjectId[] = req.body;
    await modelSerivce.deleteModels(modelsIds);

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
    req: ConnectedRequest<any, any, ModelsSearchCommand, any>,
    res: Response<ResponseDto<PaginationResponse<ModelReadDto>>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: Permission.ReadModel,
    });

    const command: ModelsSearchCommand = req.body;

    const { models, total } = await fieldService.search(command);

    return res.status(200).send({
      success: true,
      data: {
        data: models.map((p) => toReadDto(p)),
        total,
      },
    });
  }
);

export default router;
