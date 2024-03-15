import mongoose from "mongoose";
import { IOrderCreateCommand, OrderStatusEnum } from "roottypes";

import IOrderRepository from "../ports/interfaces/IOrderRepository";
import Order from "./order.mongoose.model";
import { entityPopulationOptions } from "../../../entity/adapters/entity.mongoose.repository";

const orderMongooseRepository: IOrderRepository = {
  createOrder: async (command: IOrderCreateCommand) => {
    const order = (await Order.create(command)).populate(populationOptions);

    return order;
  },

  getOrderById: async (orderId: string) => {
    return await Order.findById(new mongoose.Types.ObjectId(orderId)).populate(
      populationOptions
    );
  },
  setCheckoutSessionId: async (orderId: string, checkoutSessionId: string) => {
    return await Order.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(orderId) },
      { $set: { checkoutSessionId } },
      { new: true }
    ).populate(populationOptions);
  },
  updateOrderStatus: async (orderId: string, status: OrderStatusEnum) => {
    return await Order.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(orderId) },
      { $set: { status } }
    ).populate(populationOptions);
  },
};

const populationOptions = [
  {
    path: "products.product",
    model: "entity",
    populate: entityPopulationOptions,
  },
];

export default orderMongooseRepository;
