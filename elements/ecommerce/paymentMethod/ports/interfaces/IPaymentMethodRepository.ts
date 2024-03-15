import {
  IPaymentMethodCreateCommand,
  IPaymentMethodUpdateCommand,
} from "roottypes";

import IPaymentMethod from "./IPaymentMethod";

interface IPaymentMethodRepository {
  getPaymentMethodById: (
    paymentMethodId: string
  ) => Promise<IPaymentMethod | null>;
  getPaymentMethods: () => Promise<IPaymentMethod[]>;
  createPaymentMethod: (
    command: IPaymentMethodCreateCommand
  ) => Promise<IPaymentMethod>;
  updatePaymentMethod: (
    command: IPaymentMethodUpdateCommand
  ) => Promise<IPaymentMethod>;
  deletePaymentMethods: (paymentMethodsIds: string[]) => Promise<void>;
}

export default IPaymentMethodRepository;
