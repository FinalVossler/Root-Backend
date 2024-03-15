import { IOrderCreateCommand, OrderStatusEnum } from "roottypes";

import IOrder from "./IOrder";

interface IOrderRepository {
  getOrderById: (orderId: string) => Promise<IOrder | null>;
  createOrder: (command: IOrderCreateCommand) => Promise<IOrder>;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatusEnum
  ) => Promise<IOrder | null>;
  setCheckoutSessionId: (
    orderId: string,
    checkoutSessionId: string
  ) => Promise<IOrder | null>;
}

export default IOrderRepository;
