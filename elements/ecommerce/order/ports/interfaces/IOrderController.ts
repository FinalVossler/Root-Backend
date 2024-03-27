import {
  IOrderCheckoutCommand,
  IOrderCreateCommand,
  IOrderReadDto,
  OrderStatusEnum,
} from "roottypes";

import IRequest from "../../../../../globalTypes/IRequest";
import IUser from "../../../../user/ports/interfaces/IUser";
import IResponseDto from "../../../../../globalTypes/IResponseDto";

type IOrderController = {
  createOrder: (
    req: IRequest<IOrderCreateCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IOrderReadDto>>;
  updateOrderStatus: (
    req: IRequest<{ orderId: string; status: OrderStatusEnum }>
  ) => Promise<IResponseDto<IOrderReadDto>>;
  checkout: (
    req: IRequest<IOrderCheckoutCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IOrderReadDto>>;
  isPaymentSuccessful: (
    req: IRequest<any, { orderId: string }>,
    currentUser: IUser
  ) => Promise<
    IResponseDto<{ isPaymentSuccessful: boolean; order: IOrderReadDto }>
  >;
};

export default IOrderController;
