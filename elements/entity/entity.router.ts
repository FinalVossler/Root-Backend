import { Router, Response } from "express";
import mongoose from "mongoose";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import PaginationResponse from "../../globalTypes/PaginationResponse";
import adminProtectMiddleware from "../../middleware/adminProtectMiddleware";
import protectMiddleware from "../../middleware/protectMiddleware";
import EntityCreateCommand from "./dto/EntityCreateCommand";
import EntityReadDto, { toReadDto } from "./dto/EntityReadDto";
import entityService from "./entity.service";
import { IEntity } from "./entity.model";
import EntityUpdateCommand from "./dto/EntityUpdateCommand";
import EntitiesGetCommand from "./dto/EntitiesGetCommand";
import { IUser } from "../user/user.model";

const router = Router();

router.post(
  "/",
  protectMiddleware,
  adminProtectMiddleware,
  async (
    req: ConnectedRequest<any, any, EntityCreateCommand, any>,
    res: Response<ResponseDto<EntityReadDto>>
  ) => {
    const command: EntityCreateCommand = req.body;
    const currentUser: IUser = req.user;

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
  adminProtectMiddleware,
  async (
    req: ConnectedRequest<any, any, EntityUpdateCommand, any>,
    res: Response<ResponseDto<EntityReadDto>>
  ) => {
    const command: EntityUpdateCommand = req.body;
    const currentUser: IUser = req.user;
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
  async (
    req: ConnectedRequest<any, any, EntitiesGetCommand, any>,
    res: Response<ResponseDto<PaginationResponse<EntityReadDto>>>
  ) => {
    const command: EntitiesGetCommand = req.body;
    const { entities, total } = await entityService.getEntitiesByModel(command);

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
  adminProtectMiddleware,
  async (
    req: ConnectedRequest<any, any, mongoose.ObjectId[], any>,
    res: Response<ResponseDto<void>>
  ) => {
    const entitiesIds: mongoose.ObjectId[] = req.body;
    await entityService.deleteEntities(entitiesIds);

    return res.status(200).send({
      success: true,
      data: null,
    });
  }
);

export default router;
