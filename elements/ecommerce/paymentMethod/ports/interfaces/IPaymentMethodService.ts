import {
  IPaymentMethodCreateCommand,
  IPaymentMethodUpdateCommand,
} from "roottypes";
import IPaymentMethod from "./IPaymentMethod";
import IUser from "../../../../user/ports/interfaces/IUser";

interface IPaymentMethodService {
  getPaymentMethodById: (
    paymentMethodId: string
  ) => Promise<IPaymentMethod | null>;
  getPaymentMethods: (currentUser) => Promise<IPaymentMethod[]>;
  createPaymentMethod: (
    command: IPaymentMethodCreateCommand,
    currentUser: IUser
  ) => Promise<IPaymentMethod>;
  updatePaymentMethod: (
    command: IPaymentMethodUpdateCommand,
    currentUser: IUser
  ) => Promise<IPaymentMethod>;
  deletePaymentMethods: (
    paymentMethodsIds: string[],
    currentUser: IUser
  ) => Promise<void>;
}

export default IPaymentMethodService;
