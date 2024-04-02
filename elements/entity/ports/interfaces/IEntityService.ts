import {
  IEntitiesGetCommand,
  IEntitiesSearchCommand,
  IEntitiesSetCustomDataKeyValueCommand,
  IEntityCreateCommand,
  IEntityFieldValueCommand,
  IEntityUpdateCommand,
} from "roottypes";

import IUser from "../../../user/ports/interfaces/IUser";
import IEntity from "./IEntity";
import IModel, { IModelField } from "../../../model/ports/interfaces/IModel";

interface IEntityService {
  verifyRequiredFields: (
    {
      entityFieldValueCommands,
      modelId,
    }: {
      entityFieldValueCommands: IEntityFieldValueCommand[];
      modelId: string;
    },
    currentUser: IUser
  ) => Promise<{
    valid: boolean;
    invalidFields: IModelField[];
    errorText: string;
  }>;
  usersEntityAssignmentPermissionGranted: ({
    currentUser,
    assignedUsersIds,
    modelId,
  }: {
    currentUser: IUser;
    assignedUsersIds: string[];
    modelId: string;
  }) => Promise<boolean>;
  createEntity: (
    command: IEntityCreateCommand,
    currentUser: IUser
  ) => Promise<IEntity>;
  updateEntity: (
    command: IEntityUpdateCommand,
    currentUser: IUser
  ) => Promise<IEntity>;
  getEntitiesByModel: (
    command: IEntitiesGetCommand,
    currentUser: IUser
  ) => Promise<{ entities: IEntity[]; total: number }>;
  getAssignedEntitiesByModel: (
    command: IEntitiesGetCommand,
    currentUser: IUser
  ) => Promise<{ entities: IEntity[]; total: number }>;
  deleteEntities: (entitiesIds: string[], currentUser: IUser) => Promise<void>;
  getById: (entityId: string, currentUser: IUser) => Promise<IEntity>;
  getByIdWithUncheckedPermissions: (entityId: string) => Promise<IEntity>;
  searchEntities: (
    command: IEntitiesSearchCommand,
    currentUser: IUser
  ) => Promise<{ entities: IEntity[]; total: number }>;
  setCustomDataKeyValue: (
    command: IEntitiesSetCustomDataKeyValueCommand
  ) => Promise<void>;
  checkStock: (
    entity: IEntity,
    checkBy: number
  ) => Promise<{ model: IModel; stock: number }>;
  reduceStock: (entity: IEntity, reduceBy: number) => Promise<void>;
  copyEntities: (
    modelId: string,
    entitiesIds: string[],
    currentUser: IUser
  ) => Promise<IEntity[]>;
  generateVariations: (
    entityId: string,
    currentUser: IUser
  ) => Promise<IEntity[]>;
  getEntityChildren: (entityId: string) => Promise<IEntity[]>;
}

export default IEntityService;
