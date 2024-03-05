import {
  IModelCreateCommand,
  IModelReadDto,
  IModelUpdateCommand,
  IModelsGetCommand,
  IModelsSearchCommand,
} from "roottypes";
import { modelToReadDto } from "./model.toReadDto";
import IModelController from "./interfaces/IModelController";
import IRequest from "../../../globalTypes/IRequest";
import IUser from "../../user/ports/interfaces/IUser";
import IModel from "./interfaces/IModel";
import IModelService from "./interfaces/IModelService";

const createModelController = (
  modelService: IModelService
): IModelController => ({
  createModel: async (
    req: IRequest<IModelCreateCommand>,
    currentUser: IUser
  ) => {
    const command: IModelCreateCommand = req.body;
    const model: IModel = await modelService.createModel(command, currentUser);

    return {
      success: true,
      data: modelToReadDto(model) as IModelReadDto,
    };
  },
  updateModel: async (
    req: IRequest<IModelUpdateCommand>,
    currentUser: IUser
  ) => {
    const command: IModelUpdateCommand = req.body;
    const model: IModel = await modelService.updateModel(command, currentUser);

    return {
      success: true,
      data: modelToReadDto(model) as IModelReadDto,
    };
  },
  getModels: async (req: IRequest<IModelsGetCommand>, currentUser: IUser) => {
    const { models, total } = await modelService.getModels(
      req.body,
      currentUser
    );

    return {
      success: true,
      data: {
        data: models.map((m) => modelToReadDto(m) as IModelReadDto),
        total,
      },
    };
  },
  deleteModels: async (req: IRequest<string[]>, currentUser: IUser) => {
    await modelService.deleteModels(req.body, currentUser);

    return {
      success: true,
      data: null,
    };
  },
  searchModels: async (
    req: IRequest<IModelsSearchCommand>,
    currentUser: IUser
  ) => {
    const { models, total } = await modelService.searchModels(
      req.body,
      currentUser
    );

    return {
      success: true,
      data: {
        data: models.map((p) => modelToReadDto(p) as IModelReadDto),
        total,
      },
    };
  },
});

export default createModelController;
