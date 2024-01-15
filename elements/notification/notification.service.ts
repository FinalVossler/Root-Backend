import { INotification } from "./notification.model";
import notificationRepository from "./notification.repository";
import { socketEmit } from "../../socket";
import {
  INotificationCreateCommand,
  INotificationsGetCommand,
  NotificationMessageEnum,
} from "roottypes";
import { notificationToReadDto } from "./notification.toReadDto";

const notificationService = {
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
  setNotificationToClickedBy: async ({
    notificationId,
    userId,
  }: {
    notificationId: string;
    userId: string;
  }): Promise<void> => {
    await notificationRepository.setNotificationToClickedBy({
      notificationId,
      userId,
    });
  },

  markAlluserNotificationsAsClicked: async ({
    userId,
  }: {
    userId: string;
  }): Promise<void> => {
    await notificationRepository.markAlluserNotificationsAsClicked({ userId });
  },
};

export default notificationService;
