import { OrderStatusEnum } from "roottypes";

import IUser from "../../../../user/ports/interfaces/IUser";
import IShippingMethod from "../../../shippingMethod/ports/interfaces/IShippingMethod";
import IEntity from "../../../../entity/ports/interfaces/IEntity";

interface IOrder {
  user: IUser | string;
  date: string;
  total: number;
  status: OrderStatusEnum;
  shippingMethod: IShippingMethod | string;
  shippingAddress: {
    country: string;
    postalCode: string;
    addressLine1: string;
    addressLine2: string;
    region: string;
    city: string;
  };

  products: {
    product: IEntity | string;
    quantity: number;
    price: number;
  }[];

  checkoutSessionId: string;
}

export default IOrder;
