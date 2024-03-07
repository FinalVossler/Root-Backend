import { INotificationReadDto, INotificationsGetCommand } from "roottypes";

import IRequest from "../../../../globalTypes/IRequest";
import IResponseDto from "../../../../globalTypes/IResponseDto";
import IPaginationResponse from "../../../../globalTypes/IPaginationResponse";
import IUser from "../../../user/ports/interfaces/IUser";

type INotificationController = {
  getUserNotifications: (req: IRequest<INotificationsGetCommand>) => Promise<
    IResponseDto<{
      paginationResponse: IPaginationResponse<INotificationReadDto>;
      totalUnclicked: number;
    }>
  >;
  setNotificationToClickedBy: (
    req: IRequest<{ notificationId: string }>,
    currentUser: IUser
  ) => Promise<IResponseDto<void>>;
  markAllUserNotificationsAsClicked: (
    req: IRequest,
    currentUser: IUser
  ) => Promise<IResponseDto<void>>;
};

export default INotificationController;
