import {
  IOrderCheckoutCommand,
  IOrderCreateCommand,
  OrderStatusEnum,
} from "roottypes";

import IUser from "../../../../user/ports/interfaces/IUser";
import IOrder from "./IOrder";

interface IOrderService {
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
}

export default IOrderService;
