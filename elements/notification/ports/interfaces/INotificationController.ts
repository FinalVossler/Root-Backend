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
    req: IRequest<string>,
    currentUser: IUser
  ) => Promise<IResponseDto<void>>;
  markAllUserNotificationsAsClicked: (
    currentUser: IUser
  ) => Promise<IResponseDto<void>>;
};

export default INotificationController;
