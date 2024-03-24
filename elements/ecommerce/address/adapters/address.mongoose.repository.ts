import { IAddressCreateCommand, IAddressUpdateCommand } from "roottypes";
import mongoose from "mongoose";

import IAddressRepository from "../ports/interfaces/IAddressRepository";
import IAddress from "../ports/interfaces/IAddress";
import Address from "./address.mongoose.model";

const addressMongooseRepository: IAddressRepository = {
  getAddressById: async (addressId: string) => {
    return await Address.findById(new mongoose.Types.ObjectId(addressId));
  },
  getAddresses: async () => {
    return await Address.find({});
  },
  getUserAddresses: async (userId: string) => {
    return await Address.find({ user: new mongoose.Types.ObjectId(userId) });
  },
  createAddress: async (command: IAddressCreateCommand) => {
    const address: IAddress = await Address.create({
      addressLine1: command.addressLine1,
      addressLine2: command.addressLine2,
      city: command.city,
      country: command.country,
      region: command.region,
      postalCode: command.postalCode,
      user: command.userId,
    });

    return address;
  },
  updateAddress: async (command: IAddressUpdateCommand) => {
    const oldAddress: IAddress | null = await Address.findOne({
      _id: new mongoose.Types.ObjectId(command._id),
    });

    if (!oldAddress) {
      throw new Error("Address to update not found");
    }

    const newAddress: IAddress | null = await Address.findOneAndUpdate(
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
    );

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
      { $set: { isDefault: Boolean(isDefault) } }
    );
  },
};

export default addressMongooseRepository;
