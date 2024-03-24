import {
  IAddressCreateCommand,
  IAddressUpdateCommand,
  IAddressReadDto,
} from "roottypes";

import IRequest from "../../../../../globalTypes/IRequest";
import IResponseDto from "../../../../../globalTypes/IResponseDto";
import IUser from "../../../../user/ports/interfaces/IUser";

type IAddressController = {
  getAddresses: (
    req: IRequest,
    currentUser: IUser
  ) => Promise<IResponseDto<IAddressReadDto[]>>;
  getUserAddresses: (
    req: IRequest<{ userId: string }>,
    currentUser: IUser
  ) => Promise<IResponseDto<IAddressReadDto[]>>;
  createAddress: (
    req: IRequest<IAddressCreateCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IAddressReadDto>>;
  updateAddress: (
    req: IRequest<IAddressUpdateCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IAddressReadDto>>;
  deleteAddresses: (
    req: IRequest<{ addressesIds: string[] }>,
    currentUser: IUser
  ) => Promise<IResponseDto<IAddressReadDto[]>>;
  setDefaultAddress: (
    req: IRequest<{ addressId: string }>,
    currentUser: IUser
  ) => void;
};

export default IAddressController;
