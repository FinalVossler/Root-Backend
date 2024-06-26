import IUser from "../../../../user/ports/interfaces/IUser";
import IShippingMethod from "../../../shippingMethod/ports/interfaces/IShippingMethod";
import IEntity from "../../../../entity/ports/interfaces/IEntity";
import IPaymentMethod from "../../../paymentMethod/ports/interfaces/IPaymentMethod";
import { OrderPaymentMethodEnum, OrderPaymentStatusEnum } from "roottypes";

interface IOrder {
  _id: string;
  user: IUser | string;
  number: string;
  date: string;
  total: number;
  paymentStatus: OrderPaymentStatusEnum;
  paymentMethod: IPaymentMethod | string;
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
    shippingMethod: IShippingMethod | string;
  }[];

  checkoutSessionId: string;
  checkoutSessionUrl: string;

  createdAt: string;
  updatedAt: string;
}

export default IOrder;
