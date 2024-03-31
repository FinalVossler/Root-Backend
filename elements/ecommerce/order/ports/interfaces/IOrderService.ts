import {
  IOrderCheckoutCommand,
  IOrderCreateCommand,
  IPaginationCommand,
  OrderNegativeStatusEnum,
  OrderStatusEnum,
} from "roottypes";

import IUser from "../../../../user/ports/interfaces/IUser";
import IOrder from "./IOrder";
import IEntity from "../../../../entity/ports/interfaces/IEntity";
import IShippingMethod from "../../../shippingMethod/ports/interfaces/IShippingMethod";
import IPaginationResponse from "../../../../../globalTypes/IPaginationResponse";

interface IOrderService {
  getUserOrders: (
    paginationCommand: IPaginationCommand,
    userId: string,
    currentUser: IUser
  ) => Promise<IPaginationResponse<IOrder>>;
  getUserSales: (
    paginationCommand: IPaginationCommand,
    userId: string,
    currentUser: IUser
  ) => Promise<IPaginationResponse<IOrder>>;
  getOrderById: (orderId: string) => Promise<IOrder | null>;
  generateUniqueOrderNumber: () => string;
  getOrderTotal: (
    params: {
      product: IEntity;
      quantity: number;
      shippingMethod: IShippingMethod | undefined;
    }[]
  ) => number;
  createOrder: (
    command: IOrderCreateCommand,
    currentUser: IUser
  ) => Promise<IOrder>;
  updateOrderStatus: (
    orderId: string,
    newOrderStatus: OrderStatusEnum | OrderNegativeStatusEnum
  ) => Promise<IOrder>;
  checkout: (
    command: IOrderCheckoutCommand,
    currentUser: IUser,
    orderFromCreation?: IOrder
  ) => Promise<IOrder>;
  isPaymentSuccessful: (
    orderId: string,
    currentUser: IUser
  ) => Promise<{ isPaymentSuccessful: boolean; order: IOrder }>;

  getOrderAssociatedEntities: (
    orderId: string,
    currentUser
  ) => Promise<IEntity[]>;
}

export default IOrderService;
