import mongoose from "mongoose";
import { IOrderCreateCommand, OrderStatusEnum } from "roottypes";

import IOrderRepository from "../ports/interfaces/IOrderRepository";
import Order from "./order.mongoose.model";
import { entityPopulationOptions } from "../../../entity/adapters/entity.mongoose.repository";

const orderMongooseRepository: IOrderRepository = {
  createOrder: async (command: IOrderCreateCommand, total: number) => {
    const order = (
      await Order.create({
        date: command.date,
        shippingAddress: { ...command.shippingAddress },
        shippingMethod: command.shippingMethodId,
        products: command.products.map((productInfo) => ({
          product: productInfo.productId,
          quantity: productInfo.quantity,
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

    return order;
  },

  getOrderById: async (orderId: string) => {
    return await Order.findById(new mongoose.Types.ObjectId(orderId)).populate(
      populationOptions
    );
  },
  setCheckoutSessionIdAndUrl: async (
    orderId: string,
    checkoutSessionId: string,
    checkoutSessionUrl
  ) => {
    return await Order.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(orderId) },
      { $set: { checkoutSessionId, checkoutSessionUrl } },
      { new: true }
    ).populate(populationOptions);
  },
  updateOrderStatus: async (orderId: string, status: OrderStatusEnum) => {
    return await Order.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(orderId) },
      { $set: { status } },
      { new: true }
    ).populate(populationOptions);
  },
  deleteOrders: async (ordersIds: string[]) => {
    await Order.deleteMany({
      _id: { $in: ordersIds.map((id) => new mongoose.Types.ObjectId(id)) },
    });
  },
};

const populationOptions = [
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
    path: "shippingMethod",
    model: "shippingMethod",
  },
];

export default orderMongooseRepository;
