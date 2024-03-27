import {
  IEntityReadDto,
  IOrderCheckoutCommand,
  IOrderCreateCommand,
  OrderStatusEnum,
} from "roottypes";

import IOrderService from "./interfaces/IOrderService";
import IOrderRepository from "./interfaces/IOrderRepository";
import IOrder from "./interfaces/IOrder";
import IUser from "../../../user/ports/interfaces/IUser";
import IPaymentMethod from "../../paymentMethod/ports/interfaces/IPaymentMethod";
import IEntity from "../../../entity/ports/interfaces/IEntity";
import IPaymentService from "./interfaces/IPaymentService";
import IPaymentMethodService from "../../paymentMethod/ports/interfaces/IPaymentMethodService";
import IShippingMethod from "../../shippingMethod/ports/interfaces/IShippingMethod";
import { IField } from "../../../field/ports/interfaces/IField";
import IModel from "../../../model/ports/interfaces/IModel";
import IEntityService from "../../../entity/ports/interfaces/IEntityService";
import IShippingMethodService from "../../shippingMethod/ports/interfaces/IShippingMethodService";

const createOrderService = (
  orderRepository: IOrderRepository,
  paymentService: IPaymentService,
  paymentMethodService: IPaymentMethodService,
  entityService: IEntityService,
  shippingMethodService: IShippingMethodService
): IOrderService => {
  return {
    getOrderById: async function (orderId: string) {
      return await orderRepository.getOrderById(orderId);
    },
    getOrderTotal: function (params, shippingMethod) {
      const totalProductsPrice: number = params.reduce((acc, productInfo) => {
        const priceFieldId: string = (
          (productInfo.product as IEntityReadDto).model as IModel
        ).priceField?.toString() as string;

        const price = parseInt(
          (productInfo.product as IEntityReadDto).entityFieldValues
            .find(
              (efv) => (efv.field as IField)._id.toString() === priceFieldId
            )
            ?.value.at(0)?.text || "0"
        );
        const subTotal = price * productInfo.quantity;

        return acc + subTotal;
      }, 0);

      const total = totalProductsPrice + shippingMethod.price;

      return total;
    },
    createOrder: async function (
      command: IOrderCreateCommand,
      currentUser: IUser
    ) {
      // Find the shipping method first
      const shippingMethod = await shippingMethodService.getShippingMethodById(
        command.shippingMethodId
      );

      if (!shippingMethod) {
        throw new Error("shipping method not found");
      }

      // Now get each entity in the order
      const getEntitiesPromises: Promise<IEntity>[] = [];
      command.products.forEach((productInfo) => {
        getEntitiesPromises.push(
          new Promise(async (resolve, reject) => {
            const entity = await entityService.getByIdWithUncheckedPermissions(
              productInfo.productId
            );

            resolve(entity);
          })
        );
      });
      const entities: IEntity[] = await Promise.all(getEntitiesPromises);

      // Now calculate the total based on the entities' prices and the shipping method price
      const total = (this as IOrderService).getOrderTotal(
        entities.map((entity) => ({
          product: entity,
          quantity:
            command.products.find(
              (productInfo) => productInfo.productId === entity._id.toString()
            )?.quantity || 0,
        })),
        shippingMethod
      );

      // Now create the order
      let order: IOrder = await orderRepository.createOrder(command, total);

      // And now generate the checkout session ID and URL
      return await (this as IOrderService).checkout(
        { orderId: order._id.toString() },
        currentUser,
        order
      );
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
      currentUser: IUser,
      orderFromCreation?: IOrder
    ) {
      let order: IOrder | null =
        orderFromCreation ||
        (await orderRepository.getOrderById(command.orderId));

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

      // Find the shipping method
      const shippingMethod: IShippingMethod | null =
        order.shippingMethod as IShippingMethod;

      if (!shippingMethod) {
        throw new Error("shipping method not found");
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

      // Generate checkout session id and checkout url
      const { checkoutSessionId, checkoutSessionUrl } =
        await paymentService.makePayment({
          paymentMethod: paymentMethod.slug,
          successUrl:
            process.env.ORIGIN + "/successfulPayment/" + order._id.toString(),
          cancelUrl:
            process.env.ORIGIN + "/cancelledPayment/" + order._id.toString(),
          total: order.total,
          currency: "usd",
          productName: order.products.reduce(
            (acc, productInfo, index) =>
              acc +
              productInfo.quantity +
              "X" +
              (productInfo.product as IEntityReadDto)._id.toString() +
              (index < (order?.products.length || 0) - 1 ? "," : ""),
            ""
          ),
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
    isPaymentSuccessful: async function (orderId: string, currentUser: IUser) {
      let order: IOrder | null = await (this as IOrderService).getOrderById(
        orderId
      );

      if (!order) {
        throw new Error("Order not found");
      }

      const orderUserId =
        typeof order.user === "string"
          ? order.user
          : order?.user._id.toString();

      if (currentUser._id.toString() !== orderUserId) {
        throw new Error("Permission denied");
      }

      if (!order.checkoutSessionId) {
        throw new Error("Doesn't doesn't possess a checkout session id");
      }

      const isPaymentSuccessful: boolean =
        await paymentService.isPaymentSuccessful(order.checkoutSessionId);

      if (order.status === OrderStatusEnum.Pending) {
        order = await (this as IOrderService).updateOrderStatus(
          order._id,
          OrderStatusEnum.Paid
        );
      }

      return {
        isPaymentSuccessful,
        order,
      };
    },
  };
};

export default createOrderService;
