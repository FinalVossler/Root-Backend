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
    date: order.date,
    products: order.products.map((productInformation) => ({
      price: productInformation.price,
      product: entityToReadDto(productInformation.product as IEntity),
      quantity: productInformation.price,
    })),
    shippingAddress: order.shippingAddress,
    shippingMethod: order.shippingMethod
      ? shippingMethodToReadDto(order.shippingMethod)
      : "",
    paymentMethod: order.paymentMethod
      ? paymentMethodToReadDto(order.paymentMethod)
      : "",
    status: order.status,
    total: order.total,
    user: userToReadDto(order.user),
    checkoutSessionId: order.checkoutSessionId,
    checkoutSessionUrl: order.checkoutSessionUrl,
  };
};

export default orderToReadDto;
