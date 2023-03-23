import mongoose from "mongoose";

import { IEntity } from "./entity.model";
import EntitiesGetCommand from "./dto/EntitiesGetCommand";
import entityRepository from "./entity.repository";
import EntityCreateCommand from "./dto/EntityCreateCommand";
import EntityUpdateCommand from "./dto/EntityUpdateCommand";

const entityService = {
  createEntity: async (command: EntityCreateCommand): Promise<IEntity> => {
    const entity: IEntity = await entityRepository.create(command);

    return entity;
  },
  updateEntity: async (command: EntityUpdateCommand): Promise<IEntity> => {
    const entity: IEntity = await entityRepository.update(command);

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
};

export default entityService;
