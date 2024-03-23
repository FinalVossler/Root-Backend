import { IAddressReadDto } from "roottypes";

import IAddress from "./interfaces/IAddress";
import { userToReadDto } from "../../../user/ports/user.toReadDto";

const addressToReadDto = (address: IAddress): IAddressReadDto => {
  return {
    _id: address._id,
    country: address.country,
    postalCode: address.postalCode,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2,
    region: address.region,
    city: address.city,

    user: address.user ? userToReadDto(address.user) : undefined,
  };
};

export default addressToReadDto;
