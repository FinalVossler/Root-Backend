import {
  IShippingMethodCreateCommand,
  IShippingMethodUpdateCommand,
} from "roottypes";

import IRequest from "../../../../globalTypes/IRequest";
import IShippingMethodController from "./interfaces/IShippingMethodController";
import IUser from "../../../user/ports/interfaces/IUser";
import IShippingMethod from "./interfaces/IShippingMethod";
import IShippingMethodService from "./interfaces/IShippingMethodService";
import shippingMethodToReadDto from "./shippingMethod.toReadDto";

const createShippingMethodController = (
  shippingMethodService: IShippingMethodService
): IShippingMethodController => {
  return {
    getShippingMethods: async (req: IRequest, currentUser: IUser) => {
      const shippingMethods: IShippingMethod[] =
        await shippingMethodService.getShippingMethods(currentUser);

      return {
        success: true,
        data: shippingMethods.map(
          (p) => shippingMethodToReadDto(p) as IShippingMethod
        ),
      };
    },
    createShippingMethod: async (
      req: IRequest<IShippingMethodCreateCommand>,
      currentUser: IUser
    ) => {
      const shippingMethod: IShippingMethod =
        await shippingMethodService.createShippingMethod(req.body, currentUser);

      return {
        success: true,
        data: shippingMethodToReadDto(shippingMethod) as IShippingMethod,
      };
    },
    updateShippingMethod: async (
      req: IRequest<IShippingMethodUpdateCommand>,
      currentUser: IUser
    ) => {
      const shippingMethod: IShippingMethod =
        await shippingMethodService.updateShippingMethod(req.body, currentUser);

      return {
        success: true,
        data: shippingMethodToReadDto(shippingMethod) as IShippingMethod,
      };
    },
    deleteShippingMethods: async (
      req: IRequest<{ shippingMethodsIds: string[] }>,
      currentUser: IUser
    ) => {
      await shippingMethodService.deleteShippingMethods(
        req.body.shippingMethodsIds,
        currentUser
      );

      return {
        success: true,
        data: null,
      };
    },
  };
};

export default createShippingMethodController;
