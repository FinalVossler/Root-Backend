import {
  IEntitiesGetCommand,
  IEntitiesSearchCommand,
  IEntitiesSetCustomDataKeyValueCommand,
  IEntityCreateCommand,
  IEntityReadDto,
  IEntityUpdateCommand,
} from "roottypes";

import { entityToReadDto } from "./entity.toReadDto";
import IUser from "../../user/ports/interfaces/IUser";
import IEntity from "./interfaces/IEntity";
import IEntityService from "./interfaces/IEntityService";
import IEntityController from "./interfaces/IEntityController";
import IRequest from "../../../globalTypes/IRequest";
import orderToReadDto from "../../ecommerce/order/ports/order.toReadDto";

const createEntityController = (
  entityService: IEntityService
): IEntityController => ({
  getEntity: async (
    req: IRequest<any, any, { entityId: string }>,
    currentUser: IUser
  ) => {
    const { entity, concernedOrder } = await entityService.getById(
      req.query.entityId,
      currentUser
    );

    return {
      success: true,
      data: {
        entity: entityToReadDto(entity) as IEntityReadDto,
        concernedOrder: concernedOrder
          ? orderToReadDto(concernedOrder)
          : undefined,
      },
    };
  },
  createEntity: async (
    req: IRequest<IEntityCreateCommand>,
    currentUser: IUser
  ) => {
    const entity: IEntity = await entityService.createEntity(
      req.body,
      currentUser
    );

    return {
      success: true,
      data: entityToReadDto(entity) as IEntityReadDto,
    };
  },
  updateEntity: async (
    req: IRequest<IEntityUpdateCommand>,
    currentUser: IUser
  ) => {
    const entity: IEntity = await entityService.updateEntity(
      req.body,
      currentUser
    );

    return {
      success: true,
      data: entityToReadDto(entity) as IEntityReadDto,
    };
  },
  getEntitiesByModel: async (
    req: IRequest<IEntitiesGetCommand>,
    currentUser: IUser
  ) => {
    const { entities, total } = await entityService.getEntitiesByModel(
      req.body,
      currentUser
    );

    return {
      success: true,
      data: {
        data: entities.map((e) => entityToReadDto(e) as IEntityReadDto),
        total,
      },
    };
  },
  getAssignedEntitiesByModel: async (
    req: IRequest<IEntitiesGetCommand>,
    currentUser: IUser
  ) => {
    const { entities, total } = await entityService.getAssignedEntitiesByModel(
      req.body,
      currentUser
    );

    return {
      success: true,
      data: {
        data: entities.map((e) => entityToReadDto(e) as IEntityReadDto),
        total,
      },
    };
  },
  deleteEntities: async (req: IRequest<string[]>, currentUser: IUser) => {
    await entityService.deleteEntities(req.body, currentUser);

    return {
      success: true,
      data: null,
    };
  },
  searchEntities: async (
    req: IRequest<IEntitiesSearchCommand>,
    currentUser: IUser
  ) => {
    const { entities, total } = await entityService.searchEntities(
      req.body,
      currentUser
    );

    return {
      success: true,
      data: {
        data: entities.map((p) => entityToReadDto(p) as IEntityReadDto),
        total,
      },
    };
  },
  setCustomDataKeyValue: async (
    req: IRequest<IEntitiesSetCustomDataKeyValueCommand>,
    currentUser: IUser
  ) => {
    await entityService.setCustomDataKeyValue(req.body);

    return {
      success: true,
      data: {},
    };
  },
  copyEntities: async (
    req: IRequest<{ modelId: string; entitiesIds: string[] }>,
    currentUser: IUser
  ) => {
    const copiedEntities = await entityService.copyEntities(
      req.body.modelId,
      req.body.entitiesIds,
      currentUser
    );

    return {
      success: true,
      data: copiedEntities.map((e) => entityToReadDto(e) as IEntityReadDto),
    };
  },
  generateVariations: async (
    req: IRequest<{ entityId: string }>,
    currentUser: IUser
  ) => {
    const variations = await entityService.generateVariations(
      req.body.entityId,
      currentUser
    );

    return {
      success: true,
      data: variations.map((e) => entityToReadDto(e) as IEntityReadDto),
    };
  },
});

export default createEntityController;
