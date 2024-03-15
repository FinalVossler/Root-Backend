import {
  IShippingMethodCreateCommand,
  IShippingMethodReadDto,
  IShippingMethodUpdateCommand,
} from "roottypes";

import IRequest from "../../../../../globalTypes/IRequest";
import IResponseDto from "../../../../../globalTypes/IResponseDto";
import IUser from "../../../../user/ports/interfaces/IUser";

type IShippingMethodController = {
  getShippingMethods: (
    req: IRequest,
    currentUser: IUser
  ) => Promise<IResponseDto<IShippingMethodReadDto[]>>;
  createShippingMethod: (
    req: IRequest<IShippingMethodCreateCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IShippingMethodReadDto>>;
  updateShippingMethod: (
    req: IRequest<IShippingMethodUpdateCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IShippingMethodReadDto>>;
  deleteShippingMethods: (
    req: IRequest<{ shippingMethodsIds: string[] }>,
    currentUser: IUser
  ) => Promise<IResponseDto<IShippingMethodReadDto[]>>;
};

export default IShippingMethodController;
