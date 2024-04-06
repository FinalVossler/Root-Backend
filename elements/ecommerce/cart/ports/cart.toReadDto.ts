import { ICartReadDto } from "roottypes";

import ICart from "./interfaces/ICart";
import { entityToReadDto } from "../../../entity/ports/entity.toReadDto";
import IEntity from "../../../entity/ports/interfaces/IEntity";
import { userToReadDto } from "../../../user/ports/user.toReadDto";

const cartToReadDto = (cart: ICart): ICartReadDto => {
  return {
    _id: cart._id,
    products: cart.products?.map((productInformation) => {
      return {
        product: entityToReadDto(productInformation.product as IEntity),
        quantity: productInformation.quantity,
        sided: productInformation.sided,
      };
    }),
    user: cart.user ? userToReadDto(cart.user) : cart.user,
  };
};

export default cartToReadDto;
