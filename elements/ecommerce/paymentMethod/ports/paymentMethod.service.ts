import {
  IPaymentMethodCreateCommand,
  IPaymentMethodUpdateCommand,
  PermissionEnum,
} from "roottypes";

import IPaymentMethodService from "./interfaces/IPaymentMethodService";
import IUser from "../../../user/ports/interfaces/IUser";
import IPaymentMethod from "./interfaces/IPaymentMethod";
import IPaymentMethodRepository from "./interfaces/IPaymentMethodRepository";
import IRoleService from "../../../role/ports/interfaces/IRoleService";
import IPaymentService from "../../order/ports/interfaces/IPaymentService";

const createPaymentMethodService = (
  paymentMethodRepository: IPaymentMethodRepository,
  roleService: IRoleService,
  paymentService: IPaymentService
): IPaymentMethodService => ({
  getPaymentMethodById: async (paymentMethodId: string) => {
    return paymentMethodRepository.getPaymentMethodById(paymentMethodId);
  },
  getPaymentMethods: async (currentUser: IUser) => {
    if (
      !roleService.checkPermission({
        user: currentUser,
        permission: PermissionEnum.ReadPaymentMethod,
      })
    ) {
      throw new Error("Permission denied");
    }

    const paymentMethods: IPaymentMethod[] =
      await paymentMethodRepository.getPaymentMethods();

    return paymentMethods;
  },
  createPaymentMethod: async (
    command: IPaymentMethodCreateCommand,
    currentUser: IUser
  ) => {
    if (
      !roleService.checkPermission({
        user: currentUser,
        permission: PermissionEnum.CreatePaymentMethod,
      })
    ) {
      throw new Error("Permission denied");
    }

    if (!(await paymentService.checkPaymentMethodValidity(command.slug))) {
      throw new Error("Unsupported payment method");
    }

    const paymentMethod: IPaymentMethod =
      await paymentMethodRepository.createPaymentMethod(command);

    return paymentMethod;
  },
  updatePaymentMethod: async (
    command: IPaymentMethodUpdateCommand,
    currentUser: IUser
  ) => {
    if (
      !roleService.checkPermission({
        user: currentUser,
        permission: PermissionEnum.UpdatePaymentMethod,
      })
    ) {
      throw new Error("Permission denied");
    }

    if (!(await paymentService.checkPaymentMethodValidity(command.slug))) {
      throw new Error("Unsupported payment method");
    }

    const paymentMethod: IPaymentMethod =
      await paymentMethodRepository.updatePaymentMethod(command);

    return paymentMethod;
  },
  deletePaymentMethods: async (
    paymentMethodsIds: string[],
    currentUser: IUser
  ) => {
    if (
      !roleService.checkPermission({
        user: currentUser,
        permission: PermissionEnum.DeletePaymentMethod,
      })
    ) {
      throw new Error("Permission denied");
    }

    await paymentMethodRepository.deletePaymentMethods(paymentMethodsIds);
  },
});

export default createPaymentMethodService;
