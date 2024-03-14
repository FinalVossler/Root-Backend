import { ICartReadDto } from "roottypes";

import ICart from "./interfaces/ICart";
import { entityToReadDto } from "../../../entity/ports/entity.toReadDto";
import IEntity from "../../../entity/ports/interfaces/IEntity";

const cartToReadDto = (cart: ICart): ICartReadDto => {
  return {
    products: cart.products?.map((productInformation) => {
      return {
        product: entityToReadDto(productInformation.product as IEntity),
        quantity: productInformation.quantity,
      };
    }),
    user: cart.user,
  };
};

export default cartToReadDto;
