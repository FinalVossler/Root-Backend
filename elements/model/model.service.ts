import mongoose from "mongoose";

import { IModel } from "./model.model";
import modelRepository from "./model.repository";
import {
  IModelCreateCommand,
  IModelUpdateCommand,
  IModelsGetCommand,
  IModelsSearchCommand,
} from "roottypes";

const modelSerivce = {
  createModel: async (command: IModelCreateCommand): Promise<IModel> => {
    const model: IModel = await modelRepository.create(command);

    return model;
  },
  updateModel: async (command: IModelUpdateCommand): Promise<IModel> => {
    const model: IModel = await modelRepository.update(command);

    return model;
  },
  getModels: async (
    command: IModelsGetCommand
  ): Promise<{ models: IModel[]; total: number }> => {
    const { models, total } = await modelRepository.getModels(command);

    return { models, total };
  },
  getById: async (id: string): Promise<IModel> => {
    return await modelRepository.getById(id);
  },
  getModelsByIds: async (
    command: IModelsGetCommand,
    ids: string[]
  ): Promise<{ models: IModel[]; total: number }> => {
    const { models, total } = await modelRepository.getModelsByIds(
      command,
      ids
    );

    return { models, total };
  },
  deleteModels: async (modelsIds: string[]): Promise<void> => {
    await modelRepository.deleteModels(modelsIds);
  },
  search: async (
    command: IModelsSearchCommand
  ): Promise<{ models: IModel[]; total: number }> => {
    const { models, total } = await modelRepository.search(command);

    return { models, total };
  },
};

export default modelSerivce;
