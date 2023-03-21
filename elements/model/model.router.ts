import { Router, Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import { IModel } from "./model.model";
import PaginationResponse from "../../globalTypes/PaginationResponse";
import adminProtectMiddleware from "../../middleware/adminProtectMiddleware";
import fieldService from "./model.service";
import protectMiddleware from "../../middleware/protectMiddleware";
import mongoose from "mongoose";
import ModelCreateCommand from "./dto/ModelCreateCommand";
import modelSerivce from "./model.service";
import ModelReadDto, { toReadDto } from "./dto/ModelReadDto";
import ModelUpdateCommand from "./dto/ModelUpdateCommand";
import ModelsGetCommand from "./dto/ModelsGetCommand";

const router = Router();

router.post(
  "/",
  protectMiddleware,
  adminProtectMiddleware,
  async (
    req: ConnectedRequest<any, any, ModelCreateCommand, any>,
    res: Response<ResponseDto<ModelReadDto>>
  ) => {
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
  adminProtectMiddleware,
  async (
    req: ConnectedRequest<any, any, ModelUpdateCommand, any>,
    res: Response<ResponseDto<ModelReadDto>>
  ) => {
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
  async (
    req: ConnectedRequest<any, any, ModelsGetCommand, any>,
    res: Response<ResponseDto<PaginationResponse<ModelReadDto>>>
  ) => {
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
  adminProtectMiddleware,
  async (
    req: ConnectedRequest<any, any, mongoose.ObjectId[], any>,
    res: Response<ResponseDto<void>>
  ) => {
    const modelsIds: mongoose.ObjectId[] = req.body;
    await modelSerivce.deleteModels(modelsIds);

    return res.status(200).send({
      success: true,
      data: null,
    });
  }
);

export default router;
