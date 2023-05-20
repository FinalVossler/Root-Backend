import { Router, Response } from "express";
import mongoose from "mongoose";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import PaginationResponse from "../../globalTypes/PaginationResponse";
import protectMiddleware from "../../middleware/protectMiddleware";
import EntityCreateCommand from "./dto/EntityCreateCommand";
import EntityReadDto, { toReadDto } from "./dto/EntityReadDto";
import entityService from "./entity.service";
import { IEntity } from "./entity.model";
import EntityUpdateCommand from "./dto/EntityUpdateCommand";
import EntitiesGetCommand from "./dto/EntitiesGetCommand";
import { IUser } from "../user/user.model";
import EntitiesSearchCommand from "./dto/EntitiesSearchCommand";
import roleService from "../role/role.service";
import { StaticPermission } from "../entityPermission/entityPermission.model";
import entityRepository from "./entity.repository";
import EntitiesGetEntityCommand from "./dto/EntitiesGetEntityCommand";

const router = Router();

router.get(
  "/getEntity",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, any, EntitiesGetEntityCommand>,
    res: Response<ResponseDto<EntityReadDto>>
  ) => {
    const command: EntitiesGetEntityCommand = req.query;
    const currentUser: IUser = req.user;

    roleService.checkEntityPermission({
      user: currentUser,
      staticPermission: StaticPermission.Read,
      modelId: command.modelId,
    });

    const entity: IEntity = await entityService.getById(command.entityId);

    return res.status(200).send({
      success: true,
      data: toReadDto(entity),
    });
  }
);

router.post(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, EntityCreateCommand, any>,
    res: Response<ResponseDto<EntityReadDto>>
  ) => {
    const command: EntityCreateCommand = req.body;
    const currentUser: IUser = req.user;

    roleService.checkEntityPermission({
      user: currentUser,
      staticPermission: StaticPermission.Create,
      modelId: req.body.modelId.toString(),
    });

    const entity: IEntity = await entityService.createEntity(
      command,
      currentUser
    );

    return res.status(200).send({
      success: true,
      data: toReadDto(entity),
    });
  }
);

router.put(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, EntityUpdateCommand, any>,
    res: Response<ResponseDto<EntityReadDto>>
  ) => {
    const command: EntityUpdateCommand = req.body;
    const currentUser: IUser = req.user;

    roleService.checkEntityPermission({
      user: currentUser,
      staticPermission: StaticPermission.Update,
      modelId: req.body.modelId.toString(),
    });

    const entity: IEntity = await entityService.updateEntity(
      command,
      currentUser
    );

    return res.status(200).send({
      success: true,
      data: toReadDto(entity),
    });
  }
);

router.post(
  "/getEntitiesByModel",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, EntitiesGetCommand, any>,
    res: Response<ResponseDto<PaginationResponse<EntityReadDto>>>
  ) => {
    const command: EntitiesGetCommand = req.body;
    const { entities, total } = await entityService.getEntitiesByModel(command);

    roleService.checkEntityPermission({
      user: req.user,
      staticPermission: StaticPermission.Read,
      modelId: command.modelId.toString(),
    });

    return res.status(200).send({
      success: true,
      data: {
        data: entities.map((e) => toReadDto(e)),
        total,
      },
    });
  }
);

router.delete(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, mongoose.ObjectId[], any>,
    res: Response<ResponseDto<void>>
  ) => {
    const entitiesIds: mongoose.ObjectId[] = req.body;

    if (entitiesIds.length > 0) {
      const entity: IEntity = await entityRepository.getById(
        entitiesIds[0].toString()
      );

      roleService.checkEntityPermission({
        user: req.user,
        staticPermission: StaticPermission.Read,
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
    req: ConnectedRequest<any, any, EntitiesSearchCommand, any>,
    res: Response<ResponseDto<PaginationResponse<EntityReadDto>>>
  ) => {
    const command: EntitiesSearchCommand = req.body;

    roleService.checkEntityPermission({
      user: req.user,
      staticPermission: StaticPermission.Read,
      modelId: command.modelId.toString(),
    });

    const { entities, total } = await entityService.search(command);

    return res.status(200).send({
      success: true,
      data: {
        data: entities.map((p) => toReadDto(p)),
        total,
      },
    });
  }
);

export default router;
