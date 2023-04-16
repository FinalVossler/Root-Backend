import mongoose from "mongoose";

import { IEntity } from "./entity.model";
import EntitiesGetCommand from "./dto/EntitiesGetCommand";
import entityRepository from "./entity.repository";
import EntityCreateCommand from "./dto/EntityCreateCommand";
import EntityUpdateCommand from "./dto/EntityUpdateCommand";
import { IUser } from "../user/user.model";
import EntitiesSearchCommand from "./dto/EntitiesSearchCommand";

const entityService = {
  createEntity: async (
    command: EntityCreateCommand,
    currentUser: IUser
  ): Promise<IEntity> => {
    const entity: IEntity = await entityRepository.create(command, currentUser);

    return entity;
  },
  updateEntity: async (
    command: EntityUpdateCommand,
    currentUser: IUser
  ): Promise<IEntity> => {
    const entity: IEntity = await entityRepository.update(command, currentUser);

    return entity;
  },
  getEntitiesByModel: async (
    command: EntitiesGetCommand
  ): Promise<{ entities: IEntity[]; total: number }> => {
    const { entities, total } = await entityRepository.getEntitiesByModel(
      command
    );

    return { entities, total };
  },
  deleteEntities: async (entitiesIds: mongoose.ObjectId[]): Promise<void> => {
    await entityRepository.deleteEntities(entitiesIds);
  },
  getById: async (entityId: string): Promise<IEntity> => {
    return await entityRepository.getById(entityId);
  },
  search: async (
    command: EntitiesSearchCommand
  ): Promise<{ entities: IEntity[]; total: number }> => {
    const { entities, total } = await entityRepository.search(command);

    return { entities, total };
  },
};

export default entityService;
