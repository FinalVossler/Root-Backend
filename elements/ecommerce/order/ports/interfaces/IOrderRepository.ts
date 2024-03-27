import { IOrderCreateCommand, OrderStatusEnum } from "roottypes";

import IOrder from "./IOrder";

interface IOrderRepository {
  getOrderById: (orderId: string) => Promise<IOrder | null>;
  createOrder: (command: IOrderCreateCommand, total: number) => Promise<IOrder>;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatusEnum
  ) => Promise<IOrder | null>;
  setCheckoutSessionIdAndUrl: (
    orderId: string,
    checkoutSessionId: string,
    checkoutSessionUrl: string
  ) => Promise<IOrder | null>;
  deleteOrders: (orderIds: string[]) => Promise<void>;
}

export default IOrderRepository;
