import {
  IShippingMethodCreateCommand,
  IShippingMethodUpdateCommand,
} from "roottypes";
import mongoose from "mongoose";

import IShippingMethodRepository from "../ports/interfaces/IShippingMethodRepository";
import IShippingMethod from "../ports/interfaces/IShippingMethod";
import ShippingMethod from "./shippingMethod.mongoose.model";
import getNewTranslatedTextsForUpdate from "../../../../utils/getNewTranslatedTextsForUpdate";

const shippingMethodMongooseRepository: IShippingMethodRepository = {
  getShippingMethodById: async (shippingMethodId: string) => {
    return await ShippingMethod.findById(
      new mongoose.Types.ObjectId(shippingMethodId)
    );
  },
  getShippingMethods: async () => {
    return await ShippingMethod.find({});
  },
  createShippingMethod: async (command: IShippingMethodCreateCommand) => {
    const shippingMethod: IShippingMethod = await ShippingMethod.create({
      name: [{ text: command.name, language: command.language }],
      price: command.price,
    });

    return shippingMethod;
  },
  updateShippingMethod: async (command: IShippingMethodUpdateCommand) => {
    const oldShippingMethod: IShippingMethod | null =
      await ShippingMethod.findOne({
        _id: new mongoose.Types.ObjectId(command._id),
      });

    if (!oldShippingMethod) {
      throw new Error("Shipping method to update not found");
    }

    const newShippingMethod: IShippingMethod | null =
      await ShippingMethod.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(command._id) },
        {
          $set: {
            name: getNewTranslatedTextsForUpdate({
              language: command.language,
              newText: command.name,
              oldValue: oldShippingMethod.name,
            }),
            price: command.price,
          },
        },
        { new: true }
      );

    return newShippingMethod as IShippingMethod;
  },
  deleteShippingMethods: async (shippingMethodsIds: string[]) => {
    await ShippingMethod.deleteMany({
      _id: {
        $in: shippingMethodsIds
          .filter((el) => Boolean(el))
          .map((id) => new mongoose.Types.ObjectId(id)),
      },
    });
  },
};

export default shippingMethodMongooseRepository;
