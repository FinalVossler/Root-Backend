import mongoose from "mongoose";
import ModelCreateCommand from "./dto/ModelCreateCommand";
import ModelsGetCommand from "./dto/ModelsGetCommand";
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
  deleteModels: async (modelsIds: mongoose.ObjectId[]): Promise<void> => {
    await modelRepository.deleteModels(modelsIds);
  },
};

export default modelSerivce;
