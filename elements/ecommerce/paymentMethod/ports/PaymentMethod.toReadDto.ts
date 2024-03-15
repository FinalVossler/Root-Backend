import { IPaymentMethodReadDto } from "roottypes";

import IPaymentMethod from "./interfaces/IPaymentMethod";

const paymentMethodToReadDto = (
  paymentMethod: IPaymentMethod
): IPaymentMethodReadDto => {
  return {
    _id: paymentMethod._id,
    name: paymentMethod.name,
    slug: paymentMethod.slug,
  };
};

export default paymentMethodToReadDto;
