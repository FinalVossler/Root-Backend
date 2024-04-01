import {
  IShippingMethodCreateCommand,
  IShippingMethodUpdateCommand,
  PermissionEnum,
} from "roottypes";

import IShippingMethodService from "./interfaces/IShippingMethodService";
import IUser from "../../../user/ports/interfaces/IUser";
import IShippingMethod from "./interfaces/IShippingMethod";
import IShippingMethodRepository from "./interfaces/IShippingMethodRepository";
import IRoleService from "../../../role/ports/interfaces/IRoleService";

const createShippingMethodService = (
  paymentMethodRepository: IShippingMethodRepository,
  roleService: IRoleService
): IShippingMethodService => ({
  getShippingMethodById: async (paymentMethodId: string) => {
    return paymentMethodRepository.getShippingMethodById(paymentMethodId);
  },
  getShippingMethods: async (currentUser: IUser) => {
    // Shipping methods should be accessible for anyone trying to buy
    // if (
    //   !roleService.checkPermission({
    //     user: currentUser,
    //     permission: PermissionEnum.ReadShippingMethod,
    //   })
    // ) {
    //   throw new Error("Permission denied");
    // }

    const paymentMethods: IShippingMethod[] =
      await paymentMethodRepository.getShippingMethods();

    return paymentMethods;
  },
  createShippingMethod: async (
    command: IShippingMethodCreateCommand,
    currentUser: IUser
  ) => {
    roleService.checkPermission({
      user: currentUser,
      permission: PermissionEnum.CreateShippingMethod,
    });

    const paymentMethod: IShippingMethod =
      await paymentMethodRepository.createShippingMethod(command);

    return paymentMethod;
  },
  updateShippingMethod: async (
    command: IShippingMethodUpdateCommand,
    currentUser: IUser
  ) => {
    roleService.checkPermission({
      user: currentUser,
      permission: PermissionEnum.UpdateShippingMethod,
    });

    const paymentMethod: IShippingMethod =
      await paymentMethodRepository.updateShippingMethod(command);

    return paymentMethod;
  },
  deleteShippingMethods: async (
    paymentMethodsIds: string[],
    currentUser: IUser
  ) => {
    roleService.checkPermission({
      user: currentUser,
      permission: PermissionEnum.DeleteShippingMethod,
    });

    await paymentMethodRepository.deleteShippingMethods(paymentMethodsIds);
  },
});

export default createShippingMethodService;
