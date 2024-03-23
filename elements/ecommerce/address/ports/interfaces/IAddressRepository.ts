import { IAddressCreateCommand, IAddressUpdateCommand } from "roottypes";

import IAddress from "./IAddress";

interface IAddressRepository {
  getAddressById: (addressId: string) => Promise<IAddress | null>;
  getAddresses: () => Promise<IAddress[]>;
  getUserAddresses: (userId: string) => Promise<IAddress[]>;
  createAddress: (command: IAddressCreateCommand) => Promise<IAddress>;
  updateAddress: (command: IAddressUpdateCommand) => Promise<IAddress>;
  deleteAddresses: (addressesIds: string[]) => Promise<void>;
}

export default IAddressRepository;
