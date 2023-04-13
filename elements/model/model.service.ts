import mongoose from "mongoose";
import { IRole } from "../role/role.model";
import ModelCreateCommand from "./dto/ModelCreateCommand";
import ModelsGetCommand from "./dto/ModelsGetCommand";
import ModelsSearchCommand from "./dto/ModelsSearchCommand";
import ModelUpdateCommand from "./dto/ModelUpdateCommand";
import { IModel } from "./model.model";
import modelRepository from "./model.repository";

const modelSerivce = {
  createModel: async (command: ModelCreateCommand): Promise<IModel> => {
    const model: IModel = await modelRepository.create(command);

    return model;
  },
  updateModel: async (command: ModelUpdateCommand): Promise<IModel> => {
    const model: IModel = await modelRepository.update(command);

    return model;
  },
  getModels: async (
    command: ModelsGetCommand
  ): Promise<{ models: IModel[]; total: number }> => {
    const { models, total } = await modelRepository.getModels(command);

    return { models, total };
  },
  getModelsByIds: async (
    command: ModelsGetCommand,
    ids: string[]
  ): Promise<{ models: IModel[]; total: number }> => {
    const { models, total } = await modelRepository.getModelsByIds(
      command,
      ids
    );

    return { models, total };
  },
  deleteModels: async (modelsIds: mongoose.ObjectId[]): Promise<void> => {
    await modelRepository.deleteModels(modelsIds);
  },
  search: async (
    command: ModelsSearchCommand
  ): Promise<{ models: IModel[]; total: number }> => {
    const { models, total } = await modelRepository.search(command);

    return { models, total };
  },
};

export default modelSerivce;
