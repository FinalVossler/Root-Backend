import {
  IOrderCreateCommand,
  IPaginationCommand,
  OrderStatusEnum,
} from "roottypes";

import IOrder from "./IOrder";
import IUser from "../../../../user/ports/interfaces/IUser";
import IPaginationResponse from "../../../../../globalTypes/IPaginationResponse";

interface IOrderRepository {
  getUserOrders: (
    command: IPaginationCommand,
    userId: string
  ) => Promise<IPaginationResponse<IOrder>>;
  getOrderById: (orderId: string) => Promise<IOrder | null>;
  createOrder: (
    command: IOrderCreateCommand,
    total: number,
    number: string
  ) => Promise<IOrder>;
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
