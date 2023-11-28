import { Router, Response } from "express";
import mongoose from "mongoose";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import { IModel } from "./model.model";
import PaginationResponse from "../../globalTypes/PaginationResponse";
import protectMiddleware from "../../middleware/protectMiddleware";
import ModelCreateCommand from "./dto/ModelCreateCommand";
import modelSerivce from "./model.service";
import ModelReadDto, { toReadDto } from "./dto/ModelReadDto";
import ModelUpdateCommand from "./dto/ModelUpdateCommand";
import ModelsGetCommand from "./dto/ModelsGetCommand";
import ModelsSearchCommand from "./dto/ModelsSearchCommand";
import roleService from "../role/role.service";
import { Permission } from "../role/role.model";
import { StaticPermission } from "../entityPermission/entityPermission.model";

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
    // Models are always parsed at the beginning for the menu, so we need a try and catch for permission checking in case we don't have direct access to them.
    try {
      roleService.checkPermission({
        user: req.user,
        permission: Permission.ReadModel,
      });
    } catch (e) {
      // If we can't read the models, we should at least be able to read the entities to which we have read access (and that are based on the models)
      const { models, total } = await modelSerivce.getModelsByIds(
        req.body,
        req.user?.role?.entityPermissions
          ?.filter(
            (ePermission) =>
              ePermission.permissions.indexOf(StaticPermission.Read) !== -1
          )
          .map((ePermission) => ePermission.model._id.toString()) || []
      );

      return res.status(200).send({
        success: true,
        data: {
          data: models.map((m) => toReadDto(m)),
          total,
        },
      });
    }

    const command: ModelsGetCommand = req.body;
    const { models, total } = await modelSerivce.getModels(command);

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
    req: ConnectedRequest<any, any, mongoose.Types.ObjectId[], any>,
    res: Response<ResponseDto<void>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: Permission.DeleteModel,
    });

    const modelsIds: mongoose.Types.ObjectId[] = req.body;
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

    const { models, total } = await modelSerivce.search(command);

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
