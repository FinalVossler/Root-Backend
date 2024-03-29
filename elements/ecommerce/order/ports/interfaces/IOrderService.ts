import {
  IOrderCheckoutCommand,
  IOrderCreateCommand,
  IPaginationCommand,
  OrderStatusEnum,
} from "roottypes";

import IUser from "../../../../user/ports/interfaces/IUser";
import IOrder from "./IOrder";
import IEntity from "../../../../entity/ports/interfaces/IEntity";
import IShippingMethod from "../../../shippingMethod/ports/interfaces/IShippingMethod";
import IPaginationResponse from "../../../../../globalTypes/IPaginationResponse";

interface IOrderService {
  getUserOrders: (
    command: IPaginationCommand,
    userId: string,
    currentUser: IUser
  ) => Promise<IPaginationResponse<IOrder>>;
  getOrderById: (orderId: string) => Promise<IOrder | null>;
  generateUniqueOrderNumber: () => string;
  getOrderTotal: (
    params: { product: IEntity; quantity: number }[],
    shippingMethod: IShippingMethod
  ) => number;
  createOrder: (
    command: IOrderCreateCommand,
    currentUser: IUser
  ) => Promise<IOrder>;
  updateOrderStatus: (
    orderId: string,
    newOrderStatus: OrderStatusEnum
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
}

export default IOrderService;
