import mongoose from "mongoose";
import {
  IOrderCreateCommand,
  IPaginationCommand,
  OrderStatusEnum,
} from "roottypes";

import IOrderRepository from "../ports/interfaces/IOrderRepository";
import Order from "./order.mongoose.model";
import { entityPopulationOptions } from "../../../entity/adapters/entity.mongoose.repository";
import IOrder from "../ports/interfaces/IOrder";
import Entity from "../../../entity/adapters/entity.mongoose.model";
import IEntity from "../../../entity/ports/interfaces/IEntity";

const orderMongooseRepository: IOrderRepository = {
  getUserOrders: async (command: IPaginationCommand, userId: string) => {
    const orders = await Order.find({
      user: new mongoose.Types.ObjectId(userId),
    })
      .sort({ createdAt: -1 })
      .skip((command.page - 1) * command.limit)
      .limit(command.limit)
      .populate(populationOptions)
      .exec();

    const total: number = await Order.find({
      user: new mongoose.Types.ObjectId(userId),
    }).count();

    return { data: orders.map((o) => o.toObject()), total };
  },
  getUserSales: async (
    paginationCommand: IPaginationCommand,
    userId: string
  ) => {
    const userProductsIds = (
      await Entity.find({ owner: new mongoose.Types.ObjectId(userId) })
    ).map((e) => e._id);

    const queryParams = {
      products: {
        $elemMatch: {
          product: {
            $in: userProductsIds.map((pId) => new mongoose.Types.ObjectId(pId)),
          },
        },
      },
    };
    const orders = await Order.find(queryParams)
      .sort({ createdAt: -1 })
      .skip((paginationCommand.page - 1) * paginationCommand.limit)
      .limit(paginationCommand.limit)
      .populate(populationOptions)
      .exec();

    const total = await Order.find(queryParams).count();

    return { data: orders.map((o) => o.toObject()), total };
  },
  createOrder: async (
    command: IOrderCreateCommand,
    total: number,
    number: string
  ) => {
    const order = (
      await Order.create({
        number,
        date: command.date,
        shippingAddress: { ...command.shippingAddress },
        products: command.products.map((productInfo) => ({
          product: productInfo.productId,
          quantity: productInfo.quantity,
          shippingMethod: productInfo.shippingMethodId,
        })),
        total,
        status: command.status,
        user: command.userId,
        checkoutSessionId: undefined,
        ...(command.paymentMethodId
          ? {
              paymentMethod: command.paymentMethodId,
            }
          : {}),
      })
    ).populate(populationOptions);

    return (await order).toObject();
  },

  getOrderById: async (orderId: string) => {
    const order = await Order.findById(
      new mongoose.Types.ObjectId(orderId)
    ).populate(populationOptions);

    return order?.toObject();
  },
  setCheckoutSessionIdAndUrl: async (
    orderId: string,
    checkoutSessionId: string,
    checkoutSessionUrl
  ) => {
    const order = await Order.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(orderId) },
      { $set: { checkoutSessionId, checkoutSessionUrl } },
      { new: true }
    ).populate(populationOptions);

    return order?.toObject();
  },
  updateOrderStatus: async (
    orderId: string,
    status: OrderStatusEnum,
    isNegative: boolean
  ) => {
    const order = await Order.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(orderId) },
      { $set: isNegative ? { negativeStatus: status } : { status } },
      { new: true }
    ).populate(populationOptions);

    return order?.toObject();
  },
  deleteOrders: async (ordersIds: string[]) => {
    await Order.deleteMany({
      _id: { $in: ordersIds.map((id) => new mongoose.Types.ObjectId(id)) },
    });
  },
  getOrderAssociatedEntities: async (orderId: string) => {
    const entities = await Entity.find({
      "orderAssociationConfig.orderId": orderId,
    }).populate(entityPopulationOptions);

    return entities.map((e) => e.toObject());
  },
  getNumberOfOrdersWithEntities: async (entitiesIds: string[]) => {
    const numberOfOrdersWithEntity = await Order.find({
      "products.product": {
        $in: entitiesIds.map((id) => new mongoose.Types.ObjectId(id)),
      },
    }).count();

    return numberOfOrdersWithEntity;
  },
};

const populationOptions = [
  {
    path: "user",
    model: "user",
  },
  {
    path: "products.product",
    model: "entity",
    populate: entityPopulationOptions,
  },
  {
    path: "paymentMethod",
    model: "paymentMethod",
  },
  {
    path: "products.shippingMethod",
    model: "shippingMethod",
  },
];

export default orderMongooseRepository;
