import {
  IPaymentMethodCreateCommand,
  IPaymentMethodReadDto,
  IPaymentMethodUpdateCommand,
} from "roottypes";

import IRequest from "../../../../../globalTypes/IRequest";
import IResponseDto from "../../../../../globalTypes/IResponseDto";
import IUser from "../../../../user/ports/interfaces/IUser";

type IPaymentMethodController = {
  getPaymentMethods: (
    req: IRequest,
    currentUser: IUser
  ) => Promise<IResponseDto<IPaymentMethodReadDto[]>>;
  createPaymentMethod: (
    req: IRequest<IPaymentMethodCreateCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IPaymentMethodReadDto>>;
  updatePaymentMethod: (
    req: IRequest<IPaymentMethodUpdateCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IPaymentMethodReadDto>>;
  deletePaymentMethods: (
    req: IRequest<{ paymentMethodsIds: string[] }>,
    currentUser: IUser
  ) => Promise<IResponseDto<IPaymentMethodReadDto[]>>;
};

export default IPaymentMethodController;
