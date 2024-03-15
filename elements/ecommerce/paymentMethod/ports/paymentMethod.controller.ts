import {
  IPaymentMethodCreateCommand,
  IPaymentMethodUpdateCommand,
} from "roottypes";

import IRequest from "../../../../globalTypes/IRequest";
import IPaymentMethodController from "./interfaces/IPaymentMethodController";
import IUser from "../../../user/ports/interfaces/IUser";
import IPaymentMethod from "./interfaces/IPaymentMethod";
import IPaymentMethodService from "./interfaces/IPaymentMethodService";
import paymentMethodToReadDto from "./PaymentMethod.toReadDto";

const createPaymentMethodController = (
  paymentMethodService: IPaymentMethodService
): IPaymentMethodController => {
  return {
    getPaymentMethods: async (req: IRequest, currentUser: IUser) => {
      const paymentMethods: IPaymentMethod[] =
        await paymentMethodService.getPaymentMethods(currentUser);

      return {
        success: true,
        data: paymentMethods.map((p) => paymentMethodToReadDto(p)),
      };
    },
    createPaymentMethod: async (
      req: IRequest<IPaymentMethodCreateCommand>,
      currentUser: IUser
    ) => {
      const paymentMethod: IPaymentMethod =
        await paymentMethodService.createPaymentMethod(req.body, currentUser);

      return {
        success: true,
        data: paymentMethodToReadDto(paymentMethod),
      };
    },
    updatePaymentMethod: async (
      req: IRequest<IPaymentMethodUpdateCommand>,
      currentUser: IUser
    ) => {
      const paymentMethod: IPaymentMethod =
        await paymentMethodService.updatePaymentMethod(req.body, currentUser);

      return {
        success: true,
        data: paymentMethodToReadDto(paymentMethod),
      };
    },
    deletePaymentMethods: async (
      req: IRequest<{ paymentMethodsIds: string[] }>,
      currentUser: IUser
    ) => {
      await paymentMethodService.deletePaymentMethods(
        req.body.paymentMethodsIds,
        currentUser
      );

      return {
        success: true,
        data: null,
      };
    },
  };
};

export default createPaymentMethodController;
