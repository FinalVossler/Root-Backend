import {
  IEntityReadDto,
  IOrderCheckoutCommand,
  IOrderCreateCommand,
  IOrderReadDto,
  IPaginationCommand,
  OrderPaymentStatusEnum,
} from "roottypes";

import IRequest from "../../../../../globalTypes/IRequest";
import IUser from "../../../../user/ports/interfaces/IUser";
import IResponseDto from "../../../../../globalTypes/IResponseDto";
import IPaginationResponse from "../../../../../globalTypes/IPaginationResponse";

type IOrderController = {
  getUserOrders: (
    req: IRequest<{ paginationCommand: IPaginationCommand; userId: string }>,
    currentUser: IUser
  ) => Promise<IResponseDto<IPaginationResponse<IOrderReadDto>>>;
  getUserSales: (
    req: IRequest<{ paginationCommand: IPaginationCommand; userId: string }>,
    currentUser: IUser
  ) => Promise<IResponseDto<IPaginationResponse<IOrderReadDto>>>;
  createOrder: (
    req: IRequest<IOrderCreateCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IOrderReadDto>>;
  updateOrderPaymentStatus: (
    req: IRequest<{
      orderId: string;
      status: OrderPaymentStatusEnum;
    }>
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
  getOrderAssociatedEntities: (
    req: IRequest<any, { orderId: string }>,
    currentUser: IUser
  ) => Promise<IResponseDto<IEntityReadDto[]>>;
};

export default IOrderController;
