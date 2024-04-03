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
  getOrderById: (orderId: string) => Promise<IOrder | null | undefined>;
  createOrder: (
    command: IOrderCreateCommand,
    total: number,
    number: string
  ) => Promise<IOrder>;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatusEnum | OrderNegativeStatusEnum,
    isNegativeStatus: boolean
  ) => Promise<IOrder | null | undefined>;
  setCheckoutSessionIdAndUrl: (
    orderId: string,
    checkoutSessionId: string,
    checkoutSessionUrl: string
  ) => Promise<IOrder | null | undefined>;
  deleteOrders: (orderIds: string[]) => Promise<void>;
  getOrderAssociatedEntities: (orderId: string) => Promise<IEntity[]>;
  getNumberOfOrdersWithEntities: (entitiesIds: string[]) => Promise<number>;
}

export default IOrderRepository;
