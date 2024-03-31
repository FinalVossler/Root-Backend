import {
  IOrderCreateCommand,
  IPaginationCommand,
  OrderNegativeStatusEnum,
  OrderStatusEnum,
} from "roottypes";

import IOrder from "./IOrder";
import IPaginationResponse from "../../../../../globalTypes/IPaginationResponse";
import IEntity from "../../../../entity/ports/interfaces/IEntity";

interface IOrderRepository {
  getUserOrders: (
    command: IPaginationCommand,
    userId: string
  ) => Promise<IPaginationResponse<IOrder>>;
  getUserSales: (
    paginationCommand: IPaginationCommand,
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
    status: OrderStatusEnum | OrderNegativeStatusEnum,
    isNegativeStatus: boolean
  ) => Promise<IOrder | null>;
  setCheckoutSessionIdAndUrl: (
    orderId: string,
    checkoutSessionId: string,
    checkoutSessionUrl: string
  ) => Promise<IOrder | null>;
  deleteOrders: (orderIds: string[]) => Promise<void>;
  getOrderAssociatedEntities: (orderId: string) => Promise<IEntity[]>;
}

export default IOrderRepository;
