import {
  IEntityReadDto,
  IOrderCheckoutCommand,
  IOrderCreateCommand,
  IPaginationCommand,
  OrderStatusEnum,
} from "roottypes";

import IRequest from "../../../../globalTypes/IRequest";
import IOrderController from "./interfaces/IOrderController";
import IUser from "../../../user/ports/interfaces/IUser";
import IOrder from "./interfaces/IOrder";
import IOrderService from "./interfaces/IOrderService";
import orderToReadDto from "./order.toReadDto";
import { entityToReadDto } from "../../../entity/ports/entity.toReadDto";

const createOrderController = (
  orderService: IOrderService
): IOrderController => {
  return {
    getUserOrders: async (
      req: IRequest<{ paginationCommand: IPaginationCommand; userId: string }>,
      currentUser: IUser
    ) => {
      const result = await orderService.getUserOrders(
        req.body.paginationCommand,
        currentUser._id.toString(),
        currentUser
      );

      return {
        data: {
          data: result.data.map((o) => orderToReadDto(o)),
          total: result.total,
        },
        success: true,
      };
    },
    getUserSales: async (
      req: IRequest<{ paginationCommand: IPaginationCommand; userId: string }>,
      currentUser: IUser
    ) => {
      const result = await orderService.getUserSales(
        req.body.paginationCommand,
        currentUser._id.toString(),
        currentUser
      );

      return {
        data: {
          data: result.data.map((o) => orderToReadDto(o)),
          total: result.total,
        },
        success: true,
      };
    },
    createOrder: async (
      req: IRequest<IOrderCreateCommand>,
      currentUser: IUser
    ) => {
      const order: IOrder = await orderService.createOrder(
        req.body,
        currentUser
      );

      return {
        success: true,
        data: orderToReadDto(order),
      };
    },
    updateOrderStatus: async (
      req: IRequest<{ orderId: string; status: OrderStatusEnum }>
    ) => {
      const order: IOrder = await orderService.updateOrderStatus(
        req.body.orderId,
        req.body.status
      );

      return {
        success: true,
        data: orderToReadDto(order),
      };
    },
    checkout: async (
      req: IRequest<IOrderCheckoutCommand>,
      currentUser: IUser
    ) => {
      const order: IOrder = await orderService.checkout(req.body, currentUser);

      return {
        success: true,
        data: orderToReadDto(order),
      };
    },
    isPaymentSuccessful: async (
      req: IRequest<any, { orderId: string }>,
      currentUser: IUser
    ) => {
      const { isPaymentSuccessful, order } =
        await orderService.isPaymentSuccessful(req.params.orderId, currentUser);

      return {
        success: true,
        data: { isPaymentSuccessful, order: orderToReadDto(order) },
      };
    },
    getOrderAssociatedEntities: async (
      req: IRequest<any, { orderId: string }>,
      currentUser: IUser
    ) => {
      const entities = await orderService.getOrderAssociatedEntities(
        req.params.orderId,
        currentUser
      );

      return {
        success: true,
        data: entities.map((e) => entityToReadDto(e) as IEntityReadDto),
      };
    },
  };
};

export default createOrderController;
