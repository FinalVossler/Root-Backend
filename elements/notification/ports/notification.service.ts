import {
  INotificationCreateCommand,
  INotificationsGetCommand,
  NotificationMessageEnum,
} from "roottypes";
import INotificationService from "./interfaces/INotificationService";
import IUser from "../../user/ports/interfaces/IUser";
import INotificationRepository from "./interfaces/INotificationRepository";
import { notificationToReadDto } from "./notification.toReadDto";
import { socketEmit } from "../../../socket";
import INotification from "./interfaces/INotification";

const createNotificationService = (
  notificationRepository: INotificationRepository
): INotificationService => ({
  create: async (
    command: INotificationCreateCommand
  ): Promise<INotification> => {
    const notification: INotification = await notificationRepository.create(
      command
    );

    socketEmit({
      messageType: NotificationMessageEnum.Receive,
      object: notificationToReadDto(notification),
      userIds: notification.to.map((userId) => userId.toString()),
    });

    return notification;
  },
  getUserNotifications: async (
    command: INotificationsGetCommand
  ): Promise<{
    notifications: INotification[];
    total: number;
    totalUnclicked: number;
  }> => {
    const { notifications, total, totalUnclicked } =
      await notificationRepository.getUserNotifications(command);

    return { notifications, total, totalUnclicked };
  },
  setNotificationToClickedBy: async (
    notificationId: string,
    currentUser: IUser
  ): Promise<void> => {
    await notificationRepository.setNotificationToClickedBy(
      notificationId,
      currentUser._id.toString()
    );
  },

  markAlluserNotificationsAsClicked: async (
    currentUser: IUser
  ): Promise<void> => {
    await notificationRepository.markAlluserNotificationsAsClicked(
      currentUser._id.toString()
    );
  },
});

export default createNotificationService;
