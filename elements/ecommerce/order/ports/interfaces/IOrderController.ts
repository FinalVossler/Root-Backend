import { IOrderCreateCommand, IOrderReadDto, OrderStatusEnum } from "roottypes";

import IRequest from "../../../../../globalTypes/IRequest";
import IUser from "../../../../user/ports/interfaces/IUser";
import IResponseDto from "../../../../../globalTypes/IResponseDto";

type IOrderController = {
  createOrder: (
    req: IRequest<IOrderCreateCommand>,
    currentUser: IUser
  ) => Promise<IResponseDto<IOrderReadDto>>;
  updateOrderStatus: (
    req: IRequest<{ orderId: string; status: OrderStatusEnum }>
  ) => Promise<IResponseDto<IOrderReadDto>>;
};

export default IOrderController;
