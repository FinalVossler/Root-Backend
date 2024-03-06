import {
  INotificationCreateCommand,
  INotificationsGetCommand,
} from "roottypes";

import IUser from "../../../user/ports/interfaces/IUser";
import INotification from "./INotification";

interface INotificationService {
  create: (command: INotificationCreateCommand) => Promise<INotification>;
  getUserNotifications: (command: INotificationsGetCommand) => Promise<{
    notifications: INotification[];
    total: number;
    totalUnclicked: number;
  }>;
  setNotificationToClickedBy: (
    notificationId: string,
    currentUser: IUser
  ) => Promise<void>;

  markAlluserNotificationsAsClicked: (currentUser: IUser) => Promise<void>;
}

export default INotificationService;
