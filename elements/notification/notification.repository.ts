import NotificationCreateCommand from "./dto/NotificationCreateCommand";
import NotificationsGetCommand from "./dto/NotificationsGetCommand";
import Notification, { INotification } from "./notification.model";

const notificationRepository = {
  create: async (
    command: NotificationCreateCommand
  ): Promise<INotification> => {
    const notification: INotification = await Notification.create({
      image: command.imageId,
      link: command.link,
      text: command.text,
      to: command.toIds,
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
    const notifications: INotification[] = await Notification.find({
      to: { $all: [command.userId] },
    })
      .populate(populationOptions)
      .sort({ createdAt: -1 })
      .skip(
        (command.paginationCommand.page - 1) * command.paginationCommand.limit
      )
      .limit(command.paginationCommand.limit)
      .exec();

    const total: number = await Notification.find({
      to: { $all: [command.userId] },
    }).count();

    const totalUnclicked: number = await Notification.find({
      to: { $all: [command.userId] },
      clicked: false || null,
    }).count();

    return { notifications, total, totalUnclicked };
  },
  setNotificationToClicked: async (id: string): Promise<void> => {
    await Notification.updateOne({ _id: id }, { $set: { clicked: true } });
  },
};

const populationOptions = [
  {
    path: "image",
    model: "file",
  },
  {
    path: "to",
    model: "user",
  },
];

export default notificationRepository;
