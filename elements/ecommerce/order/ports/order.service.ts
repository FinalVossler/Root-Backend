import {
  IEntityReadDto,
  IOrderCheckoutCommand,
  IOrderCreateCommand,
  IPaginationCommand,
  OrderNegativeStatusEnum,
  OrderStatusEnum,
  SuperRoleEnum,
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
import mongoose from "mongoose";

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
    generateUniqueOrderNumber: function () {
      const prefix = Math.floor(Math.random() * 1000); // Generate a random 3-digit number for the prefix
      const middle = Math.floor(Math.random() * 10000000); // Generate a random 7-digit number for the middle part
      const suffix = Math.floor(Math.random() * 10000000); // Generate a random 7-digit number for the suffix

      return `${prefix.toString().padStart(3, "0")}-${middle
        .toString()
        .padStart(7, "0")}-${suffix.toString().padStart(7, "0")}`;
    },
    getOrderTotal: function (
      params: {
        product: IEntity;
        quantity: number;
        shippingMethod: IShippingMethod | undefined;
      }[]
    ) {
      // Find the total of shipping methods by owner (Each owner is going to be paid for each individual shipping method chosen for him)
      const ownersShippingMethods: { [ownerId: string]: IShippingMethod[] } =
        {};

      params.forEach((productInfo) => {
        if (productInfo.product.owner) {
          const owner = productInfo.product.owner as IUser;
          const ownerShippingMethods: IShippingMethod[] =
            ownersShippingMethods[owner._id.toString()] || [];
          // Add the shipping method id if it isn't already added:
          if (
            productInfo.shippingMethod &&
            !ownerShippingMethods.some(
              (shippingMethod) =>
                shippingMethod._id.toString() ===
                (productInfo.shippingMethod as IShippingMethod)._id.toString()
            )
          ) {
            // Push the shipping method
            ownersShippingMethods[owner._id.toString()] = [
              ...(ownersShippingMethods[owner._id.toString()] || []),
              productInfo.shippingMethod,
            ];
          }
        }
      });

      const totalShippingMethodsPrice: number = Object.keys(
        ownersShippingMethods
      ).reduce((acc, key) => {
        return (
          acc +
          ownersShippingMethods[key].reduce(
            (secAcc, shippingMethod) => secAcc + shippingMethod.price,
            0
          )
        );
      }, 0);

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

      const total = totalProductsPrice + totalShippingMethodsPrice;

      return total;
    },
    getUserOrders: async (
      command: IPaginationCommand,
      userId: string,
      currentUser: IUser
    ) => {
      if (
        currentUser.superRole !== SuperRoleEnum.SuperAdmin &&
        currentUser._id.toString() !== userId
      ) {
        throw new Error("Permission denied");
      }

      return await orderRepository.getUserOrders(command, userId);
    },
    getUserSales: async (
      command: IPaginationCommand,
      userId: string,
      currentUser: IUser
    ) => {
      if (
        currentUser.superRole !== SuperRoleEnum.SuperAdmin &&
        currentUser._id.toString() !== userId
      ) {
        throw new Error("Permission denied");
      }

      const { total, data } = await orderRepository.getUserSales(
        command,
        userId
      );

      // Take each product in the order and take off products that don't belong to the user (for security purposes)
      // A user doesn't need to see a client's other produts within a simple order. He only needs to see his owns products
      const filteredData = data.map((order) => {
        //@ts-ignore
        const plainOrder = order.toObject();
        return {
          ...plainOrder,
          products: (plainOrder as IOrder).products.filter(
            (p) =>
              ((p.product as IEntityReadDto).owner as IUser)._id.toString() ===
              userId
          ),
        };
      });

      return { total, data: filteredData };
    },
    createOrder: async function (
      command: IOrderCreateCommand,
      currentUser: IUser
    ) {
      // Get all concerned shipping methods
      const getShippingMethodsPromises: Promise<IShippingMethod>[] = [];
      const shippingMethodIdTracker: { [shippingMethodId: string]: string } =
        {};
      command.products.forEach((productInfo) => {
        if (!shippingMethodIdTracker[productInfo.shippingMethodId]) {
          getShippingMethodsPromises.push(
            new Promise(async (resolve, reject) => {
              const shippingMethod =
                await shippingMethodService.getShippingMethodById(
                  productInfo.shippingMethodId
                );

              if (shippingMethod) {
                shippingMethodIdTracker[productInfo.shippingMethodId] =
                  productInfo.shippingMethodId;
                resolve(shippingMethod);
              } else {
                throw new Error("shipping method not found");
              }
            })
          );
        }
      });

      const shippingMethods = await Promise.all(getShippingMethodsPromises);

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

      // Now calculate the total based on the entities' prices and the shipping methods' prices
      const total = (this as IOrderService).getOrderTotal(
        entities.map((entity) => ({
          product: entity,
          quantity:
            command.products.find(
              (productInfo) => productInfo.productId === entity._id.toString()
            )?.quantity || 0,
          shippingMethod: shippingMethods.find(
            (shippingMethod) =>
              shippingMethod._id.toString() ===
              command.products.find(
                (productInfo) => productInfo.productId === entity._id.toString()
              )?.shippingMethodId
          ),
        }))
      );

      // Generate a unique order number
      const orderNumber: string = (
        this as IOrderService
      ).generateUniqueOrderNumber();
      // Now create the order
      let order: IOrder = await orderRepository.createOrder(
        command,
        total,
        orderNumber
      );

      // And now generate the checkout session ID and URL
      return await (this as IOrderService).checkout(
        { orderId: order._id.toString() },
        currentUser,
        order
      );
    },
    updateOrderStatus: async (
      orderId: string,
      newOrderStatus: OrderStatusEnum | OrderNegativeStatusEnum
    ) => {
      const isNegative = Object.values(OrderNegativeStatusEnum).some(
        (value) => value === newOrderStatus
      );

      const order: IOrder | null = await orderRepository.updateOrderStatus(
        orderId,
        newOrderStatus,
        isNegative
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

      if (order?.status !== OrderStatusEnum.Pending) {
        throw new Error("Order is already paid");
      }

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

      // Generate checkout session id and checkout url
      const { checkoutSessionId, checkoutSessionUrl } =
        await paymentService.makePayment({
          paymentMethod: paymentMethod.slug,
          successUrl:
            process.env.ORIGIN + "/paymentResult/" + order._id.toString(),
          cancelUrl:
            process.env.ORIGIN + "/paymentResult/" + order._id.toString(),
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
    getOrderAssociatedEntities: async function (
      orderId: string,
      currentUser: IUser
    ) {
      const order: IOrder | null = await (this as IOrderService).getOrderById(
        orderId
      );

      if (!order) throw new Error("Order not found");

      return await orderRepository.getOrderAssociatedEntities(orderId);
    },
  };
};

export default createOrderService;
