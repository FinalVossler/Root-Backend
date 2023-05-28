import NotificationCreateCommand from "./dto/NotificationCreateCommand";
import NotificationsGetCommand from "./dto/NotificationsGetCommand";
import { INotification } from "./notification.model";
import notificationRepository from "./notification.repository";
import { socketEmit } from "../../socket";
import NotificationMessageEnum from "../../globalTypes/NotificationMessageEnum";
import { toReadDto } from "./dto/NotificationReadDto";

const notificationService = {
  create: async (
    command: NotificationCreateCommand
  ): Promise<INotification> => {
    const notification: INotification = await notificationRepository.create(
      command
    );

    socketEmit({
      messageType: NotificationMessageEnum.Receive,
      object: toReadDto(notification),
      userIds: notification.to.map((userId) => userId.toString()),
    });

    return notification;
  },
  getUserNotifications: async (
    command: NotificationsGetCommand
  ): Promise<{
    notifications: INotification[];
    total: number;
    totalUnclicked: number;
  }> => {
    const { notifications, total, totalUnclicked } =
      await notificationRepository.getUserNotifications(command);

    return { notifications, total, totalUnclicked };
  },
  setNotificationToClicked: async (id: string): Promise<void> => {
    await notificationRepository.setNotificationToClicked(id);
  },
};

export default notificationService;
