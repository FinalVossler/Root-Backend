import { IOrderCreateCommand, OrderStatusEnum } from "roottypes";

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
  checkout: (orderId, currentUser: IUser) => Promise<IOrder>;
}

export default IOrderService;
