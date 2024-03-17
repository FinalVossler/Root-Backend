import { ICartUpdateCommand } from "roottypes";

import IRequest from "../../../../globalTypes/IRequest";
import IUser from "../../../user/ports/interfaces/IUser";
import cartToReadDto from "./cart.toReadDto";
import ICart from "./interfaces/ICart";
import ICartController from "./interfaces/ICartController";
import ICartService from "./interfaces/ICartService";

const createCartController = (cartService: ICartService): ICartController => {
  return {
    getUserCart: async (req: IRequest, currentUser: IUser) => {
      const cart: ICart = await cartService.getUserCart(currentUser);

      return {
        success: true,
        data: cartToReadDto(cart),
      };
    },
    updateCart: async (
      req: IRequest<ICartUpdateCommand>,
      currentUser: IUser
    ) => {
      const cart: ICart = await cartService.updateCart(req.body, currentUser);

      return {
        success: true,
        data: cartToReadDto(cart),
      };
    },
  };
};

export default createCartController;
