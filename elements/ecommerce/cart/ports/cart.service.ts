import { ICartUpdateCommand } from "roottypes";

import IUser from "../../../user/ports/interfaces/IUser";
import ICartService from "./interfaces/ICartService";
import ICartRepository from "./interfaces/ICartRepository";
import ICart from "./interfaces/ICart";

const createCartService = (cartRepository: ICartRepository): ICartService => {
  return {
    getUserCart: async (currentUser: IUser) => {
      const cart: ICart | null = await cartRepository.getUserCart(
        currentUser._id
      );
      if (!cart) {
        const newCart: ICart = await cartRepository.createCart(currentUser._id);

        return newCart;
      } else {
        return cart;
      }
    },
    updateCart: async function (
      command: ICartUpdateCommand,
      currentUser: IUser
    ) {
      if (currentUser._id.toString() !== command.userId.toString()) {
        throw new Error("Trying to update another user's cart");
      }

      let cart: ICart = await this.getUserCart(currentUser);

      // Todo: Add quantity validators here:

      if (!cart) {
        cart = await cartRepository.createCart(currentUser._id);
      }

      return await cartRepository.updateCart(command);
    },
  };
};

export default createCartService;
