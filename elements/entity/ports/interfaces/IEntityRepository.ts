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
  create: (command: IEntityCreateCommand, ownerId?: string) => Promise<IEntity>;
  update: (command: IEntityUpdateCommand) => Promise<IEntity>;
  getEntitiesByModel: (
    command: IEntitiesGetCommand
  ) => Promise<{ total: number; entities: IEntity[] }>;
  deleteEntities: (entitiesIds: string[]) => Promise<void>;
  getById: (entityId: string) => Promise<IEntity | undefined>;
  getUnpopulatedByIds: (ids: string[]) => Promise<IEntity[]>;
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
  copyEntities: (ids: string[]) => Promise<IEntity[]>;
}

export default IEntityRepository;
