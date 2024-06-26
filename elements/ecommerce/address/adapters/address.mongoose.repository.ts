import { IAddressCreateCommand, IAddressUpdateCommand } from "roottypes";
import mongoose from "mongoose";

import IAddressRepository from "../ports/interfaces/IAddressRepository";
import IAddress from "../ports/interfaces/IAddress";
import Address from "./address.mongoose.model";

const addressMongooseRepository: IAddressRepository = {
  getAddressById: async (addressId: string) => {
    const address = await Address.findById(
      new mongoose.Types.ObjectId(addressId)
    ).lean();

    return address;
  },
  getAddresses: async () => {
    return await Address.find({}).lean();
  },
  getUserAddresses: async (userId: string) => {
    return await Address.find({
      user: new mongoose.Types.ObjectId(userId),
    }).lean();
  },
  createAddress: async (command: IAddressCreateCommand) => {
    const address = await Address.create({
      addressLine1: command.addressLine1,
      addressLine2: command.addressLine2,
      city: command.city,
      country: command.country,
      region: command.region,
      postalCode: command.postalCode,
      user: command.userId,
    });

    return address.toObject();
  },
  updateAddress: async (command: IAddressUpdateCommand) => {
    const oldAddress: IAddress | null = await Address.findOne({
      _id: new mongoose.Types.ObjectId(command._id),
    });

    if (!oldAddress) {
      throw new Error("Address to update not found");
    }

    const newAddress = await Address.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(command._id) },
      {
        $set: {
          addressLine1: command.addressLine1,
          addressLine2: command.addressLine2,
          city: command.city,
          country: command.country,
          region: command.region,
          postalCode: command.postalCode,
        },
      },
      { new: true }
    ).lean();

    return newAddress as IAddress;
  },
  deleteAddresses: async (addressesIds: string[]) => {
    await Address.deleteMany({
      _id: {
        $in: addressesIds
          .filter((el) => Boolean(el))
          .map((id) => new mongoose.Types.ObjectId(id)),
      },
    });
  },
  setIsDefault: async (addressId: string, isDefault: boolean) => {
    return await Address.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(addressId) },
      { $set: { isDefault: Boolean(isDefault) } },
      { new: true }
    ).lean();
  },
};

export default addressMongooseRepository;
