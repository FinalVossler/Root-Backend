import { Router, Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import PaginationResponse from "../../globalTypes/PaginationResponse";
import protectMiddleware from "../../middleware/protectMiddleware";
import entityService from "./entity.service";
import { IEntity } from "./entity.model";
import { IUser } from "../user/user.model";
import roleService from "../role/role.service";
import entityRepository from "./entity.repository";
import {
  IEntitiesGetCommand,
  IEntitiesSearchCommand,
  IEntitiesSetCustomDataKeyValueCommand,
  IEntityCreateCommand,
  IEntityReadDto,
  IEntityUpdateCommand,
  StaticPermissionEnum,
} from "roottypes";
import { entityToReadDto } from "./entity.toReadDto";

const router = Router();

router.get(
  "/getEntity",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, any, { entityId: string }>,
    res: Response<ResponseDto<IEntityReadDto>>
  ) => {
    const currentUser: IUser = req.user;

    console.log("entityId", req.query.entityId);

    const entity: IEntity = await entityService.getById(req.query.entityId);
    console.log("entity", JSON.stringify(entity));

    roleService.checkEntityPermission({
      user: currentUser,
      staticPermission: StaticPermissionEnum.Read,
      modelId: entity.model._id.toString(),
    });

    console.log("got the entity and checked permission");

    return res.status(200).send({
      success: true,
      data: entityToReadDto(entity),
    });
  }
);

router.post(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, IEntityCreateCommand, any>,
    res: Response<ResponseDto<IEntityReadDto>>
  ) => {
    const command: IEntityCreateCommand = req.body;
    const currentUser: IUser = req.user;

    roleService.checkEntityPermission({
      user: currentUser,
      staticPermission: StaticPermissionEnum.Create,
      modelId: req.body.modelId.toString(),
    });

    const entity: IEntity = await entityService.createEntity(
      command,
      currentUser
    );

    return res.status(200).send({
      success: true,
      data: entityToReadDto(entity),
    });
  }
);

router.put(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, IEntityUpdateCommand, any>,
    res: Response<ResponseDto<IEntityReadDto>>
  ) => {
    const command: IEntityUpdateCommand = req.body;
    const currentUser: IUser = req.user;

    roleService.checkEntityPermission({
      user: currentUser,
      staticPermission: StaticPermissionEnum.Update,
      modelId: req.body.modelId.toString(),
    });

    const entity: IEntity = await entityService.updateEntity(
      command,
      currentUser
    );

    return res.status(200).send({
      success: true,
      data: entityToReadDto(entity),
    });
  }
);

router.post(
  "/getEntitiesByModel",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, IEntitiesGetCommand, any>,
    res: Response<ResponseDto<PaginationResponse<IEntityReadDto>>>
  ) => {
    const command: IEntitiesGetCommand = req.body;

    roleService.checkEntityPermission({
      user: req.user,
      staticPermission: StaticPermissionEnum.Read,
      modelId: command.modelId.toString(),
    });

    const { entities, total } = await entityService.getEntitiesByModel(command);

    return res.status(200).send({
      success: true,
      data: {
        data: entities.map((e) => entityToReadDto(e)),
        total,
      },
    });
  }
);

router.post(
  "/getAssignedEntitiesByModel",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, IEntitiesGetCommand, any>,
    res: Response<ResponseDto<PaginationResponse<IEntityReadDto>>>
  ) => {
    const command: IEntitiesGetCommand = req.body;

    roleService.checkEntityPermission({
      user: req.user,
      staticPermission: StaticPermissionEnum.Read,
      modelId: command.modelId.toString(),
    });

    const { entities, total } = await entityService.getAssignedEntitiesByModel(
      command
    );

    return res.status(200).send({
      success: true,
      data: {
        data: entities.map((e) => entityToReadDto(e)),
        total,
      },
    });
  }
);

router.delete(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, string[], any>,
    res: Response<ResponseDto<void>>
  ) => {
    const entitiesIds: string[] = req.body;

    if (entitiesIds.length > 0) {
      const entity: IEntity | undefined = await entityRepository.getById(
        entitiesIds[0].toString()
      );

      if (!entity) {
        throw new Error("Entity not found");
      }

      roleService.checkEntityPermission({
        user: req.user,
        staticPermission: StaticPermissionEnum.Read,
        modelId: entity.model._id.toString(),
      });

      await entityService.deleteEntities(entitiesIds);
    }

    return res.status(200).send({
      success: true,
      data: null,
    });
  }
);

router.post(
  "/search",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, IEntitiesSearchCommand, any>,
    res: Response<ResponseDto<PaginationResponse<IEntityReadDto>>>
  ) => {
    const command: IEntitiesSearchCommand = req.body;

    roleService.checkEntityPermission({
      user: req.user,
      staticPermission: StaticPermissionEnum.Read,
      modelId: command.modelId.toString(),
    });

    const { entities, total } = await entityService.search(command);

    return res.status(200).send({
      success: true,
      data: {
        data: entities.map((p) => entityToReadDto(p)),
        total,
      },
    });
  }
);

router.post(
  "/setCustomDataKeyValue",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, IEntitiesSetCustomDataKeyValueCommand, any>,
    res: Response<ResponseDto<any>>
  ) => {
    const command: IEntitiesSetCustomDataKeyValueCommand = req.body;

    await entityService.setCustomDataKeyValue(command);

    return res.status(200).send({
      success: true,
      data: {},
    });
  }
);

export default router;
