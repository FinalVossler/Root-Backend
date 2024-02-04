import { Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import { IModel } from "./model.model";
import PaginationResponse from "../../globalTypes/PaginationResponse";
import modelSerivce from "./model.service";
import roleService from "../role/role.service";
import {
  IModelCreateCommand,
  IModelReadDto,
  IModelUpdateCommand,
  IModelsGetCommand,
  IModelsSearchCommand,
  PermissionEnum,
  StaticPermissionEnum,
} from "roottypes";
import { modelToReadDto } from "./model.toReadDto";
import { IEntityPermission } from "../entityPermission/entityPermission.model";
import { IRole } from "../role/role.model";

const modelController = {
  createModel: async (
    req: ConnectedRequest<any, any, IModelCreateCommand, any>,
    res: Response<ResponseDto<IModelReadDto>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: PermissionEnum.CreateModel,
    });

    const command: IModelCreateCommand = req.body;
    const model: IModel = await modelSerivce.createModel(command);

    return res.status(200).send({
      success: true,
      data: modelToReadDto(model) as IModelReadDto,
    });
  },
  updateModel: async (
    req: ConnectedRequest<any, any, IModelUpdateCommand, any>,
    res: Response<ResponseDto<IModelReadDto>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: PermissionEnum.UpdateModel,
    });

    const command: IModelUpdateCommand = req.body;
    const model: IModel = await modelSerivce.updateModel(command);

    return res.status(200).send({
      success: true,
      data: modelToReadDto(model) as IModelReadDto,
    });
  },
  getModels: async (
    req: ConnectedRequest<any, any, IModelsGetCommand, any>,
    res: Response<ResponseDto<PaginationResponse<IModelReadDto>>>
  ) => {
    // Models are always parsed at the beginning for the menu, so we need a try and catch for permission checking in case we don't have direct access to them.
    try {
      roleService.checkPermission({
        user: req.user,
        permission: PermissionEnum.ReadModel,
      });
    } catch (e) {
      // If we can't read the models, we should at least be able to read the entities to which we have read access (and that are based on the models)
      const { models, total } = await modelSerivce.getModelsByIds(
        req.body,
        ((req.user?.role as IRole)?.entityPermissions as IEntityPermission[])
          ?.filter(
            (ePermission) =>
              ePermission.permissions.indexOf(StaticPermissionEnum.Read) !== -1
          )
          .map((ePermission) => (ePermission.model as IModel)._id.toString()) ||
          []
      );

      return res.status(200).send({
        success: true,
        data: {
          data: models.map((m) => modelToReadDto(m) as IModelReadDto),
          total,
        },
      });
    }

    const command: IModelsGetCommand = req.body;
    const { models, total } = await modelSerivce.getModels(command);

    return res.status(200).send({
      success: true,
      data: {
        data: models.map((m) => modelToReadDto(m) as IModelReadDto),
        total,
      },
    });
  },
  deleteModels: async (
    req: ConnectedRequest<any, any, string[], any>,
    res: Response<ResponseDto<void>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: PermissionEnum.DeleteModel,
    });

    const modelsIds: string[] = req.body;
    await modelSerivce.deleteModels(modelsIds);

    return res.status(200).send({
      success: true,
      data: null,
    });
  },
  searchModels: async (
    req: ConnectedRequest<any, any, IModelsSearchCommand, any>,
    res: Response<ResponseDto<PaginationResponse<IModelReadDto>>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: PermissionEnum.ReadModel,
    });

    const command: IModelsSearchCommand = req.body;

    const { models, total } = await modelSerivce.search(command);

    return res.status(200).send({
      success: true,
      data: {
        data: models.map((p) => modelToReadDto(p) as IModelReadDto),
        total,
      },
    });
  },
};

export default modelController;
