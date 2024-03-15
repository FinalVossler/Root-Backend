import {
  IShippingMethodCreateCommand,
  IShippingMethodUpdateCommand,
} from "roottypes";

import IShippingMethod from "./IShippingMethod";
import IUser from "../../../../user/ports/interfaces/IUser";

interface IShippingMethodService {
  getShippingMethodById: (
    shippingMethodId: string
  ) => Promise<IShippingMethod | null>;
  getShippingMethods: (currentUser) => Promise<IShippingMethod[]>;
  createShippingMethod: (
    command: IShippingMethodCreateCommand,
    currentUser: IUser
  ) => Promise<IShippingMethod>;
  updateShippingMethod: (
    command: IShippingMethodUpdateCommand,
    currentUser: IUser
  ) => Promise<IShippingMethod>;
  deleteShippingMethods: (
    shippingMethodsIds: string[],
    currentUser: IUser
  ) => Promise<void>;
}

export default IShippingMethodService;
