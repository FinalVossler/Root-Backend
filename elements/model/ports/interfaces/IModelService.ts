import {
  IModelCreateCommand,
  IModelUpdateCommand,
  IModelsGetCommand,
  IModelsSearchCommand,
} from "roottypes";

import IUser from "../../../user/ports/interfaces/IUser";
import IModel from "./IModel";

interface IModelService {
  createModel: (
    command: IModelCreateCommand,
    currentUser: IUser
  ) => Promise<IModel>;
  updateModel: (
    command: IModelUpdateCommand,
    currentUser: IUser
  ) => Promise<IModel>;
  getModels: (
    command: IModelsGetCommand,
    currentUser: IUser
  ) => Promise<{ models: IModel[]; total: number }>;
  getById: (id: string, currentUser: IUser) => Promise<IModel>;
  getModelsByIds: (
    command: IModelsGetCommand,
    ids: string[],
    currentUser: IUser
  ) => Promise<{ models: IModel[]; total: number }>;
  deleteModels: (modelsIds: string[], currentUser: IUser) => Promise<void>;
  searchModels: (
    command: IModelsSearchCommand,
    currentUser: IUser
  ) => Promise<{ models: IModel[]; total: number }>;
}

export default IModelService;
