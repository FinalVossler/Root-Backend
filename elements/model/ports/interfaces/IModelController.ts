import {
  IModelCreateCommand,
  IModelReadDto,
  IModelUpdateCommand,
  IModelsGetCommand,
  IModelsSearchCommand,
} from "roottypes";

import IRequest from "../../../../globalTypes/IRequest";
import IResponseDto from "../../../../globalTypes/IResponseDto";
import IPaginationResponse from "../../../../globalTypes/IPaginationResponse";
import IUser from "../../../user/ports/interfaces/IUser";

type IModelController = {
  createModel: (
    req: IRequest<IModelCreateCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IModelReadDto>>;
  updateModel: (
    req: IRequest<IModelUpdateCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IModelReadDto>>;
  getModels: (
    req: IRequest<IModelsGetCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IPaginationResponse<IModelReadDto>>>;
  deleteModels: (
    req: IRequest<string[]>,
    currentUser: IUser
  ) => Promise<IResponseDto<void>>;
  searchModels: (
    req: IRequest<IModelsSearchCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IPaginationResponse<IModelReadDto>>>;

  copyModels: (
    req: IRequest<{ modelsIds: string[] }>,
    currentUser: IUser
  ) => Promise<IResponseDto<IModelReadDto[]>>;
};

export default IModelController;
