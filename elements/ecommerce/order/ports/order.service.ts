import {
  IOrderCheckoutCommand,
  IOrderCreateCommand,
  OrderStatusEnum,
} from "roottypes";

import IOrderService from "./interfaces/IOrderService";
import IOrderRepository from "./interfaces/IOrderRepository";
import IOrder from "./interfaces/IOrder";
import IUser from "../../../user/ports/interfaces/IUser";
import IPaymentMethod from "../../paymentMethod/ports/interfaces/IPaymentMethod";
import { entityService } from "../../../../ioc";
import IEntity from "../../../entity/ports/interfaces/IEntity";
import IPaymentService from "./interfaces/IPaymentService";

const createOrderService = (
  orderRepository: IOrderRepository,
  paymentService: IPaymentService
): IOrderService => {
  return {
    createOrder: async (command: IOrderCreateCommand) => {
      const order: IOrder = await orderRepository.createOrder(command);

      return order;
    },
    updateOrderStatus: async (
      orderId: string,
      newOrderStatus: OrderStatusEnum
    ) => {
      const order: IOrder | null = await orderRepository.updateOrderStatus(
        orderId,
        newOrderStatus
      );

      if (!order) {
        throw new Error("Order not found");
      }

      return order;
    },
    checkout: async function (
      command: IOrderCheckoutCommand,
      currentUser: IUser
    ) {
      let order: IOrder | null = await orderRepository.getOrderById(
        command.orderId
      );

      if (!order) {
        throw new Error("Order doesn't exist");
      }

      if ((order.user as IUser)._id.toString() !== currentUser._id.toString()) {
        throw new Error(
          "Permission denied. You can't checkout on the name of another user"
        );
      }

      // Set order to pending
      order = await (this as IOrderService).updateOrderStatus(
        command.orderId,
        OrderStatusEnum.Pending
      );

      // Find the payment method
      const paymentMethod: IPaymentMethod | null =
        order.paymentMethod as IPaymentMethod;

      if (!paymentMethod) {
        throw new Error("Payment method not found");
      }

      // Check available stock
      const checkStockPromises: Promise<void>[] = [];
      order.products.forEach((productInfo) => {
        checkStockPromises.push(
          new Promise(async (resolve, reject) => {
            await entityService.checkStock(
              productInfo.product as IEntity,
              productInfo.quantity
            );

            resolve();
          })
        );
      });

      // Make payment here
      const { checkoutSessionId, checkoutSessionUrl } =
        await paymentService.makePayment({
          paymentMethod: paymentMethod.slug,
          successUrl: process.env.ORIGIN + "/successfulPayment",
          cancelUrl: process.env.ORIGIN + "/cancelledPayment",
          total: order.total,
          currency: "usd",
        });

      // Now update the checkout session id and the checkout url
      order = (await orderRepository.setCheckoutSessionIdAndUrl(
        command.orderId,
        checkoutSessionId,
        checkoutSessionUrl
      )) as IOrder;

      // Now reduce the number of items in stock
      const reduceStockPromises: Promise<void>[] = [];
      order.products.forEach((productInfo) => {
        reduceStockPromises.push(
          new Promise(async (resolve, reject) => {
            try {
              await entityService.reduceStock(
                productInfo.product as IEntity,
                productInfo.quantity
              );
            } catch {
              reject("Problem reducing stock");
            }

            resolve();
          })
        );
      });

      await Promise.all(reduceStockPromises);

      return (await orderRepository.getOrderById(
        order._id.toString()
      )) as IOrder;
    },
  };
};

export default createOrderService;
