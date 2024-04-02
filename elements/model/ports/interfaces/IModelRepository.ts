import {
  IModelCreateCommand,
  IModelUpdateCommand,
  IModelsGetCommand,
  IModelsSearchCommand,
} from "roottypes";

import IModel, { IModelField } from "./IModel";

interface IModelRepository {
  create: (command: IModelCreateCommand, ownerId?: string) => Promise<IModel>;
  update: (command: IModelUpdateCommand) => Promise<IModel>;
  getModels: (
    command: IModelsGetCommand,
    ownerId?: string
  ) => Promise<{ total: number; models: IModel[] }>;

  getById: (id: string) => Promise<IModel | null | undefined>;
  getModelsContainingField: (fieldId: string) => Promise<IModel[]>;
  deleteModel: (modelId: string) => Promise<void>;
  deleteModels: (modelsIds: string[]) => Promise<void>;
  search: (
    command: IModelsSearchCommand,
    ownerId?: string
  ) => Promise<{ models: IModel[]; total: number }>;
  getModelsByIds: (
    command: IModelsGetCommand,
    ids: string[]
  ) => Promise<{ total: number; models: IModel[] }>;
  updateModelFields: (params: {
    modelId: string;
    newModelFields: IModelField[];
  }) => Promise<void>;
}

export default IModelRepository;
