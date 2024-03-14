import { ICartReadDto, ICartUpdateCommand } from "roottypes";
import IRequest from "../../../../../globalTypes/IRequest";
import IResponseDto from "../../../../../globalTypes/IResponseDto";
import IUser from "../../../../user/ports/interfaces/IUser";

type ICartController = {
  getUserCart: (
    req: IRequest,
    currentUser: IUser
  ) => Promise<IResponseDto<ICartReadDto>>;
  updateCart: (
    req: IRequest<ICartUpdateCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<ICartReadDto>>;
};

export default ICartController;
