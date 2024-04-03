import { IOrderReadDto } from "roottypes";

import IOrder from "./interfaces/IOrder";
import { entityToReadDto } from "../../../entity/ports/entity.toReadDto";
import IEntity from "../../../entity/ports/interfaces/IEntity";
import shippingMethodToReadDto from "../../shippingMethod/ports/shippingMethod.toReadDto";
import { userToReadDto } from "../../../user/ports/user.toReadDto";
import paymentMethodToReadDto from "../../paymentMethod/ports/PaymentMethod.toReadDto";

const orderToReadDto = (order: IOrder): IOrderReadDto => {
  return {
    _id: order._id,
    number: order.number,
    date: order.date,
    products: order.products.map((productInformation) => ({
      price: productInformation.price,
      product: entityToReadDto(productInformation.product as IEntity),
      quantity: productInformation.price,
      shippingMethod: productInformation.shippingMethod
        ? shippingMethodToReadDto(productInformation.shippingMethod)
        : "",
    })),
    shippingAddress: order.shippingAddress,
    paymentMethod: order.paymentMethod
      ? paymentMethodToReadDto(order.paymentMethod)
      : "",
    paymentStatus: order.paymentStatus,
    total: order.total,
    user: userToReadDto(order.user),
    checkoutSessionId: order.checkoutSessionId,
    checkoutSessionUrl: order.checkoutSessionUrl,
  };
};

export default orderToReadDto;
