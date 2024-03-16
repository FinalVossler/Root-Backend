import {
  IPaymentMethodCreateCommand,
  IPaymentMethodUpdateCommand,
} from "roottypes";
import IPaymentMethodRepository from "../ports/interfaces/IPaymentMethodRepository";
import IPaymentMethod from "../ports/interfaces/IPaymentMethod";
import PaymentMethod from "./paymentMethod.mongoose.model";
import mongoose from "mongoose";
import getNewTranslatedTextsForUpdate from "../../../../utils/getNewTranslatedTextsForUpdate";

const paymentMethodMongooseRepository: IPaymentMethodRepository = {
  getPaymentMethodById: async (paymentMethodId: string) => {
    return await PaymentMethod.findById(
      new mongoose.Types.ObjectId(paymentMethodId)
    );
  },
  getPaymentMethods: async () => {
    return await PaymentMethod.find({});
  },
  createPaymentMethod: async (command: IPaymentMethodCreateCommand) => {
    const paymentMethod: IPaymentMethod = await PaymentMethod.create({
      name: [{ text: command.name, language: command.language }],
      slug: command.slug,
    });

    return paymentMethod;
  },
  updatePaymentMethod: async (command: IPaymentMethodUpdateCommand) => {
    const oldPaymentMethod: IPaymentMethod | null = await PaymentMethod.findOne(
      { _id: new mongoose.Types.ObjectId(command._id) }
    );

    if (!oldPaymentMethod) {
      throw new Error("Payment method to update not found");
    }

    const newPaymentMethod: IPaymentMethod | null =
      await PaymentMethod.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(command._id) },
        {
          $set: {
            name: getNewTranslatedTextsForUpdate({
              language: command.language,
              newText: command.name,
              oldValue: oldPaymentMethod.name,
            }),
            slug: command.slug,
          },
        },
        { new: true }
      );

    return newPaymentMethod as IPaymentMethod;
  },
  deletePaymentMethods: async (paymentMethodsIds: string[]) => {
    await PaymentMethod.deleteMany({
      _id: {
        $in: paymentMethodsIds
          .filter((el) => Boolean(el))
          .map((id) => new mongoose.Types.ObjectId(id)),
      },
    });
  },
};

export default paymentMethodMongooseRepository;
