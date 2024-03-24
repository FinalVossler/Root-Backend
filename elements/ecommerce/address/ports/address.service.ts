import {
  IAddressCreateCommand,
  IAddressUpdateCommand,
  PermissionEnum,
} from "roottypes";

import IAddressService from "./interfaces/IAddressService";
import IUser from "../../../user/ports/interfaces/IUser";
import IAddress from "./interfaces/IAddress";
import IAddressRepository from "./interfaces/IAddressRepository";
import IRoleService from "../../../role/ports/interfaces/IRoleService";

const createAddressService = (
  addressRepository: IAddressRepository,
  roleService: IRoleService
): IAddressService => ({
  getAddressById: async (addressId: string) => {
    return addressRepository.getAddressById(addressId);
  },
  getAddresses: async (currentUser: IUser) => {
    if (
      !roleService.checkPermission({
        user: currentUser,
        permission: PermissionEnum.ReadAddress,
      })
    ) {
      throw new Error("Permission denied");
    }

    const address: IAddress[] = await addressRepository.getAddresses();

    return address;
  },
  getUserAddresses: async (userId: string, currentUser: IUser) => {
    if (
      !roleService.checkPermission({
        user: currentUser,
        permission: PermissionEnum.CreateAddress,
      }) &&
      userId !== currentUser._id.toString()
    ) {
      throw new Error("Permission denied");
    }

    const address: IAddress[] = await addressRepository.getUserAddresses(
      userId
    );

    return address;
  },
  createAddress: async (command: IAddressCreateCommand, currentUser: IUser) => {
    if (
      !roleService.checkPermission({
        user: currentUser,
        permission: PermissionEnum.CreateAddress,
      })
    ) {
      throw new Error("Permission denied");
    }

    const address: IAddress = await addressRepository.createAddress(command);

    return address;
  },
  updateAddress: async (command: IAddressUpdateCommand, currentUser: IUser) => {
    if (
      !roleService.checkPermission({
        user: currentUser,
        permission: PermissionEnum.UpdateAddress,
      })
    ) {
      throw new Error("Permission denied");
    }

    const address: IAddress = await addressRepository.updateAddress(command);

    return address;
  },
  deleteAddresses: async (addressesIds: string[], currentUser: IUser) => {
    if (
      !roleService.checkPermission({
        user: currentUser,
        permission: PermissionEnum.DeleteAddress,
      })
    ) {
      throw new Error("Permission denied");
    }

    await addressRepository.deleteAddresses(addressesIds);
  },
  setDefaultAddress: async function (addressId: string, currentUser: IUser) {
    const userAddresses: IAddress[] = await this.getUserAddresses(
      currentUser._id,
      currentUser
    );

    const addressToSetToDefault = userAddresses.find(
      (address) => address._id.toString() === addressId
    );

    if (!addressToSetToDefault) {
      throw new Error("Address not found");
    }

    const promises: Promise<IAddress | null>[] = [];

    userAddresses.forEach((address) => {
      promises.push(
        new Promise(async (resolve) => {
          resolve(
            await addressRepository.setIsDefault(
              address._id.toString(),
              address._id.toString() === addressId
            )
          );
        })
      );
    });

    await Promise.all(promises);
  },
});

export default createAddressService;
