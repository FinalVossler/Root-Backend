import {
  INotificationCreateCommand,
  INotificationsGetCommand,
} from "roottypes";
import INotification from "./INotification";

interface INotificationRepository {
  create: (command: INotificationCreateCommand) => Promise<INotification>;
  getUserNotifications: (command: INotificationsGetCommand) => Promise<{
    notifications: INotification[];
    total: number;
    totalUnclicked: number;
  }>;
  setNotificationToClickedBy: (
    notificationId: string,
    userId: string
  ) => Promise<void>;
  markAlluserNotificationsAsClicked: (userId: string) => Promise<void>;
  deleteByIds: (notificationIds: string[]) => Promise<void>;
}

export default INotificationRepository;
