import {
  IShippingMethodCreateCommand,
  IShippingMethodUpdateCommand,
} from "roottypes";

import IShippingMethod from "./IShippingMethod";

interface IShippingMethodRepository {
  getShippingMethodById: (
    ShippingMethodId: string
  ) => Promise<IShippingMethod | null>;
  getShippingMethods: () => Promise<IShippingMethod[]>;
  createShippingMethod: (
    command: IShippingMethodCreateCommand
  ) => Promise<IShippingMethod>;
  updateShippingMethod: (
    command: IShippingMethodUpdateCommand
  ) => Promise<IShippingMethod>;
  deleteShippingMethods: (ShippingMethodsIds: string[]) => Promise<void>;
}

export default IShippingMethodRepository;
