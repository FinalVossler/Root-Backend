import {
  IMicroFrontendCreateCommand,
  IMicroFrontendReadDto,
  IMicroFrontendUpdateCommand,
  IMicroFrontendsGetCommand,
  IMicroFrontendsSearchCommand,
} from "roottypes";
import IRequest from "../../../../globalTypes/IRequest";
import IResponseDto from "../../../../globalTypes/IResponseDto";
import IPaginationResponse from "../../../../globalTypes/IPaginationResponse";
import IUser from "../../../user/ports/interfaces/IUser";

type IMicroFrontendController = {
  createMicroFrontend: (
    req: IRequest<IMicroFrontendCreateCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IMicroFrontendReadDto>>;
  updateMicroFrontend: (
    req: IRequest<IMicroFrontendUpdateCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IMicroFrontendReadDto>>;
  getMicroFrontends: (
    req: IRequest<IMicroFrontendsGetCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IPaginationResponse<IMicroFrontendReadDto>>>;
  getById: (
    req: IRequest<any, { microFrontendId: string }>,
    currentUser: IUser
  ) => Promise<IResponseDto<IMicroFrontendReadDto>>;
  deleteMicroFrontends: (
    req: IRequest<string[]>,
    currentUser: IUser
  ) => Promise<IResponseDto<void>>;
  searchMicroFrontends: (
    req: IRequest<IMicroFrontendsSearchCommand>
  ) => Promise<IResponseDto<IPaginationResponse<IMicroFrontendReadDto>>>;
};

export default IMicroFrontendController;
