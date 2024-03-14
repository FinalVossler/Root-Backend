import mongoose from "mongoose";

import ICartRepository from "../ports/interfaces/ICartRepository";
import Cart from "./cart.mongoose.model";
import ICart from "../ports/interfaces/ICart";
import { ICartUpdateCommand } from "roottypes";
import { entityPopulationOptions } from "../../../entity/adapters/entity.mongoose.repository";

const cartMongooseRepository: ICartRepository = {
  createCart: async function (userId: string) {
    const cart: ICart = await Cart.create({
      user: new mongoose.Types.ObjectId(userId),
      products: [],
    });

    return await this.getUserCart(userId);
  },
  getUserCart: async (userId: string) => {
    const res = await Cart.find({
      user: new mongoose.Types.ObjectId(userId),
    })
      .populate(populationOptions)
      .exec();

    if (res.length > 0) {
      return res[0] as ICart;
    } else {
      return null;
    }
  },
  updateCart: async (command: ICartUpdateCommand) => {
    const cart = await Cart.findOneAndUpdate(
      {
        user: new mongoose.Types.ObjectId(command.userId),
      },
      {
        $set: {
          products: command.products.map((product) => ({
            quantity: product.quantity,
            product: new mongoose.Types.ObjectId(product.productId),
          })),
        },
      },
      { new: true }
    ).populate(populationOptions);

    if (!cart) {
      throw new Error("Cart not found");
    }

    return cart;
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
];

export default cartMongooseRepository;
