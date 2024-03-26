import { IPaymentMethodReadDto } from "roottypes";

import IPaymentMethod from "./interfaces/IPaymentMethod";

const paymentMethodToReadDto = (
  paymentMethod: IPaymentMethod | string
): IPaymentMethodReadDto | string => {
  console.log("paymentMethod", paymentMethod);
  console.log("type of payment method", typeof paymentMethod);
  if (
    typeof paymentMethod === "string" ||
    Object.keys(paymentMethod).length === 0
  ) {
    return paymentMethod.toString();
  }

  return {
    _id: paymentMethod._id,
    name: paymentMethod.name,
    slug: paymentMethod.slug,
  };
};

export default paymentMethodToReadDto;
