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
  bulkCreate: (object: IEntity) => Promise<IEntity>;
  update: (command: IEntityUpdateCommand) => Promise<IEntity>;
  getEntitiesByModel: (
    command: IEntitiesGetCommand,
    ownerId?: string
  ) => Promise<{ total: number; entities: IEntity[] }>;
  deleteEntities: (entitiesIds: string[]) => Promise<void>;
  getById: (entityId: string) => Promise<IEntity | undefined>;
  getUnpopulatedByIds: (ids: string[]) => Promise<IEntity[]>;
  getAssignedEntitiesByModel: (
    command: IEntitiesGetCommand,
    ownerId?: string
  ) => Promise<{ total: number; entities: IEntity[] }>;

  search: (
    command: IEntitiesSearchCommand,
    ownerId?: string
  ) => Promise<{ entities: IEntity[]; total: number }>;
  setCustomDataKeyValue: (
    command: IEntitiesSetCustomDataKeyValueCommand
  ) => Promise<void>;
  deleteByModel: (modelId: string) => Promise<void>;
  copyEntities: (ids: string[]) => Promise<IEntity[]>;
  getEntityChildren: (entityId: string) => Promise<IEntity[]>;
  updateEntitiesParents: (
    entitiesIds: string[],
    parentEntityId: string | null
  ) => Promise<void>;
}

export default IEntityRepository;
