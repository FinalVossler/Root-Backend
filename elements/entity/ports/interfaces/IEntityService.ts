import {
  IEntitiesGetCommand,
  IEntitiesSearchCommand,
  IEntitiesSetCustomDataKeyValueCommand,
  IEntityCreateCommand,
  IEntityFieldValueCommand,
  IEntityUpdateCommand,
} from "roottypes";
import { IModelField } from "../../../model/adapters/model.mongoose.model";
import IUser from "../../../user/ports/interfaces/IUser";
import IEntity from "./IEntity";

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
  searchEntities: (
    command: IEntitiesSearchCommand,
    currentUser: IUser
  ) => Promise<{ entities: IEntity[]; total: number }>;
  setCustomDataKeyValue: (
    command: IEntitiesSetCustomDataKeyValueCommand
  ) => Promise<void>;
}

export default IEntityService;
