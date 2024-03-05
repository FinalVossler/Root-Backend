import { INotificationsGetCommand } from "roottypes";
import { notificationToReadDto } from "./notification.toReadDto";
import INotificationService from "./interfaces/INotificationService";
import INotificationController from "./interfaces/INotificationController";
import IRequest from "../../../globalTypes/IRequest";
import IUser from "../../user/ports/interfaces/IUser";

const createNotificationController = (
  notificationService: INotificationService
): INotificationController => ({
  getUserNotifications: async (req: IRequest<INotificationsGetCommand>) => {
    const command: INotificationsGetCommand = req.body;
    const { notifications, total, totalUnclicked } =
      await notificationService.getUserNotifications(command);

    return {
      success: true,
      data: {
        totalUnclicked,
        paginationResponse: {
          data: notifications.map((p) => notificationToReadDto(p)),
          total,
        },
      },
    };
  },
  setNotificationToClickedBy: async (
    req: IRequest<string>,
    currentUser: IUser
  ) => {
    await notificationService.setNotificationToClickedBy(req.body, currentUser);

    return {
      success: true,
      data: null,
    };
  },
  markAllUserNotificationsAsClicked: async (currentUser: IUser) => {
    await notificationService.markAlluserNotificationsAsClicked(currentUser);

    return {
      success: true,
      data: null,
    };
  },
});

export default createNotificationController;
