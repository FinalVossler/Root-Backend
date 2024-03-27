import {
  IOrderCheckoutCommand,
  IOrderCreateCommand,
  OrderStatusEnum,
} from "roottypes";

import IUser from "../../../../user/ports/interfaces/IUser";
import IOrder from "./IOrder";
import IEntity from "../../../../entity/ports/interfaces/IEntity";
import IShippingMethod from "../../../shippingMethod/ports/interfaces/IShippingMethod";

interface IOrderService {
  getOrderById: (orderId: string) => Promise<IOrder | null>;
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
