import { IShippingMethodReadDto } from "roottypes";

import IShippingMethod from "./interfaces/IShippingMethod";

const shippingMethodToReadDto = (
  shippingMethod: IShippingMethod | string
): IShippingMethodReadDto | string => {
  if (
    typeof shippingMethod === "string" ||
    Object.keys(shippingMethod).length === 0
  ) {
    return shippingMethod.toString();
  }

  return {
    _id: shippingMethod._id,
    name: shippingMethod.name,
    price: shippingMethod.price,
  };
};

export default shippingMethodToReadDto;
