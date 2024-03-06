import {
  IRoleCreateCommand,
  IRoleReadDto,
  IRoleUpdateCommand,
  IRolesGetCommand,
  IRolesSearchCommand,
} from "roottypes";

import IRequest from "../../../../globalTypes/IRequest";
import IResponseDto from "../../../../globalTypes/IResponseDto";
import IPaginationResponse from "../../../../globalTypes/IPaginationResponse";
import IUser from "../../../user/ports/interfaces/IUser";

type IRoleController = {
  createRole: (
    req: IRequest<IRoleCreateCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IRoleReadDto>>;
  updateRole: (
    req: IRequest<IRoleUpdateCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IRoleReadDto>>;

  getRoles: (
    req: IRequest<IRolesGetCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IPaginationResponse<IRoleReadDto>>>;

  deleteRoles: (
    req: IRequest<string[]>,
    currentUser: IUser
  ) => Promise<IResponseDto<void>>;
  searchRoles: (
    req: IRequest<IRolesSearchCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IPaginationResponse<IRoleReadDto>>>;
};

export default IRoleController;
