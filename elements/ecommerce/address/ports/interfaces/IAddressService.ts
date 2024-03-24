import {
  IAddressCreateCommand,
  IAddressReadDto,
  IAddressUpdateCommand,
} from "roottypes";

import IAddress from "./IAddress";
import IUser from "../../../../user/ports/interfaces/IUser";

interface IAddressService {
  getAddressById: (addressId: string) => Promise<IAddress | null>;
  getAddresses: (currentUser) => Promise<IAddress[]>;
  getUserAddresses: (userId: string, currentUser: IUser) => Promise<IAddress[]>;
  createAddress: (
    command: IAddressCreateCommand,
    currentUser: IUser
  ) => Promise<IAddress>;
  updateAddress: (
    command: IAddressUpdateCommand,
    currentUser: IUser
  ) => Promise<IAddress>;
  deleteAddresses: (
    paymentMethodsIds: string[],
    currentUser: IUser
  ) => Promise<void>;
  setDefaultAddress: (addressId: string, currentUser: IUser) => Promise<void>;
}

export default IAddressService;
