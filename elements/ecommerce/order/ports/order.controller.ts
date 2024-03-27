import {
  IOrderCheckoutCommand,
  IOrderCreateCommand,
  OrderStatusEnum,
} from "roottypes";

import IRequest from "../../../../globalTypes/IRequest";
import IOrderController from "./interfaces/IOrderController";
import IUser from "../../../user/ports/interfaces/IUser";
import IOrder from "./interfaces/IOrder";
import IOrderService from "./interfaces/IOrderService";
import orderToReadDto from "./order.toReadDto";

const createOrderController = (
  orderService: IOrderService
): IOrderController => {
  return {
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
  };
};

export default createOrderController;
