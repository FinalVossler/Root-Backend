import {
  IPageCreateCommand,
  IPageReadDto,
  IPageUpdateCommand,
} from "roottypes";

import IRequest from "../../../../globalTypes/IRequest";
import IResponseDto from "../../../../globalTypes/IResponseDto";
import IUser from "../../../user/ports/interfaces/IUser";

type IPageController = {
  getPage: () => Promise<IResponseDto<IPageReadDto[]>>;
  createPage: (
    req: IRequest<IPageCreateCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IPageReadDto>>;
  updatePage: (
    req: IRequest<IPageUpdateCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IPageReadDto>>;
  deletePages: (
    req: IRequest<string[]>,
    currentUser: IUser
  ) => Promise<IResponseDto<void>>;
};

export default IPageController;
