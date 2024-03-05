import {
  IFieldCreateCommand,
  IFieldReadDto,
  IFieldUpdateCommand,
  IFieldsGetCommand,
  IFieldsSearchCommand,
} from "roottypes";
import IResponseDto from "../../../../globalTypes/IResponseDto";
import IPaginationResponse from "../../../../globalTypes/IPaginationResponse";
import IRequest from "../../../../globalTypes/IRequest";
import IUser from "../../../user/ports/interfaces/IUser";

export type IFieldController = {
  createField: (
    req: IRequest<IFieldCreateCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IFieldReadDto>>;
  updateField: (
    command: IRequest<IFieldUpdateCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IFieldReadDto>>;
  getFields: (
    command: IRequest<IFieldsGetCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IPaginationResponse<IFieldReadDto>>>;
  deleteFields: (
    fieldsIds: IRequest<string[]>,
    currentUser: IUser
  ) => Promise<IResponseDto<void>>;
  searchFields: (
    command: IRequest<IFieldsSearchCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IPaginationResponse<IFieldReadDto>>>;
  copyFields: (
    command: IRequest<{
      ids: string[];
    }>,
    currentUser: IUser
  ) => Promise<IResponseDto<IFieldReadDto[]>>;
};
