import {
  IEntitiesGetCommand,
  IEntitiesSearchCommand,
  IEntitiesSetCustomDataKeyValueCommand,
  IEntityCreateCommand,
  IEntityFieldValueCommand,
  IEntityUpdateCommand,
} from "roottypes";

import IEntity from "./IEntity";

interface IEntityRepository {
  combineEntityFieldValuesNewFilesAndSelectedOwnFiles: (
    entityFieldValues: IEntityFieldValueCommand[]
  ) => Promise<void>;
  create: (command: IEntityCreateCommand) => Promise<IEntity>;
  update: (command: IEntityUpdateCommand) => Promise<IEntity>;
  getEntitiesByModel: (
    command: IEntitiesGetCommand
  ) => Promise<{ total: number; entities: IEntity[] }>;
  deleteEntities: (entitiesIds: string[]) => Promise<void>;
  getById: (entityId: string) => Promise<IEntity | undefined>;
  getAssignedEntitiesByModel: (
    command: IEntitiesGetCommand
  ) => Promise<{ total: number; entities: IEntity[] }>;
  search: (
    command: IEntitiesSearchCommand
  ) => Promise<{ entities: IEntity[]; total: number }>;
  setCustomDataKeyValue: (
    command: IEntitiesSetCustomDataKeyValueCommand
  ) => Promise<void>;
  deleteByModel: (modelId: string) => Promise<void>;
}

export default IEntityRepository;
