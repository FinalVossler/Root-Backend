import {
  IEntitiesGetCommand,
  IEntitiesSearchCommand,
  IEntitiesSetCustomDataKeyValueCommand,
  IEntityCreateCommand,
  IEntityReadDto,
  IEntityUpdateCommand,
} from "roottypes";

import IRequest from "../../../../globalTypes/IRequest";
import IResponseDto from "../../../../globalTypes/IResponseDto";
import IUser from "../../../user/ports/interfaces/IUser";
import IPaginationResponse from "../../../../globalTypes/IPaginationResponse";

type IEntityController = {
  getEntity: (
    req: IRequest<any, any, { entityId: string }>,
    currentUser: IUser
  ) => Promise<IResponseDto<IEntityReadDto>>;
  createEntity: (
    req: IRequest<IEntityCreateCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IEntityReadDto>>;
  updateEntity: (
    req: IRequest<IEntityUpdateCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IEntityReadDto>>;
  getEntitiesByModel: (
    req: IRequest<IEntitiesGetCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IPaginationResponse<IEntityReadDto>>>;
  getAssignedEntitiesByModel: (
    req: IRequest<IEntitiesGetCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IPaginationResponse<IEntityReadDto>>>;
  deleteEntities: (
    req: IRequest<string[]>,
    currentUser: IUser
  ) => Promise<IResponseDto<void>>;
  searchEntities: (
    req: IRequest<IEntitiesSearchCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IPaginationResponse<IEntityReadDto>>>;
  setCustomDataKeyValue: (
    req: IRequest<IEntitiesSetCustomDataKeyValueCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<any>>;
  copyEntities: (
    req: IRequest<{ modelId: string; entitiesIds: string[] }>,
    currentUser: IUser
  ) => Promise<IResponseDto<IEntityReadDto[]>>;
};

export default IEntityController;
