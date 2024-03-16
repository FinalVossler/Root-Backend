import {
  IOrderCheckoutCommand,
  IOrderCreateCommand,
  OrderStatusEnum,
} from "roottypes";

import IOrderService from "./interfaces/IOrderService";
import IOrderRepository from "./interfaces/IOrderRepository";
import IOrder from "./interfaces/IOrder";
import IUser from "../../../user/ports/interfaces/IUser";
import IPaymentMethodService from "../../paymentMethod/ports/interfaces/IPaymentMethodService";
import IPaymentMethod from "../../paymentMethod/ports/interfaces/IPaymentMethod";
import { entityService } from "../../../../ioc";
import IEntity from "../../../entity/ports/interfaces/IEntity";
import IPaymentService from "./interfaces/IPaymentService";

const createOrderService = (
  orderRepository: IOrderRepository,
  paymentService: IPaymentService,
  paymentMethodService: IPaymentMethodService
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
        await paymentMethodService.getPaymentMethodById(
          command.paymentMethodId
        );

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
      const checkoutSessionId: string = await paymentService.makePayment({
        cancelUrl: "",
        paymentMethod: paymentMethod.slug,
        successUrl: "",
        total: order.total,
      });

      // Now update the checkout session id
      order = (await orderRepository.setCheckoutSessionId(
        command.orderId,
        checkoutSessionId
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
