import { IAddressCreateCommand, IAddressUpdateCommand } from "roottypes";

import IRequest from "../../../../globalTypes/IRequest";
import IAddressController from "./interfaces/IAddressController";
import IUser from "../../../user/ports/interfaces/IUser";
import IAddress from "./interfaces/IAddress";
import IAddressService from "./interfaces/IAddressService";
import addressToReadDto from "./address.toReadDto";

const createAddressController = (
  addressService: IAddressService
): IAddressController => {
  return {
    getAddresses: async (req: IRequest, currentUser: IUser) => {
      const addresses: IAddress[] = await addressService.getAddresses(
        currentUser
      );

      return {
        success: true,
        data: addresses.map((p) => addressToReadDto(p)),
      };
    },
    getUserAddresses: async (
      req: IRequest<{ userId: string }>,
      currentUser: IUser
    ) => {
      const addresses: IAddress[] = await addressService.getUserAddresses(
        req.body.userId,
        currentUser
      );

      return {
        success: true,
        data: addresses.map((p) => addressToReadDto(p)),
      };
    },
    createAddress: async (
      req: IRequest<IAddressCreateCommand>,
      currentUser: IUser
    ) => {
      const address: IAddress = await addressService.createAddress(
        req.body,
        currentUser
      );

      return {
        success: true,
        data: addressToReadDto(address),
      };
    },
    updateAddress: async (
      req: IRequest<IAddressUpdateCommand>,
      currentUser: IUser
    ) => {
      const address: IAddress = await addressService.updateAddress(
        req.body,
        currentUser
      );

      return {
        success: true,
        data: addressToReadDto(address),
      };
    },
    deleteAddresses: async (
      req: IRequest<{ addressesIds: string[] }>,
      currentUser: IUser
    ) => {
      await addressService.deleteAddresses(req.body.addressesIds, currentUser);

      return {
        success: true,
        data: null,
      };
    },
  };
};

export default createAddressController;
