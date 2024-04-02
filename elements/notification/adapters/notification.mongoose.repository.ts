import mongoose from "mongoose";
import Notification from "./notification.mongoose.model";
import {
  INotificationCreateCommand,
  INotificationsGetCommand,
} from "roottypes";
import INotificationRepository from "../ports/interfaces/INotificationRepository";
import INotification from "../ports/interfaces/INotification";

const notificationMongooseRepository: INotificationRepository = {
  create: async (
    command: INotificationCreateCommand
  ): Promise<INotification> => {
    const notification: INotification = await Notification.create({
      image: command.imageId || undefined,
      link: command.link,
      text: command.text,
      to: command.toIds,
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
    const notifications: INotification[] = (
      await Notification.find({
        to: { $all: [command.userId] },
      })
        .populate(populationOptions)
        .sort({ createdAt: -1 })
        .skip(
          (command.paginationCommand.page - 1) * command.paginationCommand.limit
        )
        .limit(command.paginationCommand.limit)
        .exec()
    ).map((n) => n.toObject());

    const total: number = await Notification.find({
      to: { $all: [command.userId] },
    }).count();

    const totalUnclicked: number = await Notification.find({
      to: { $all: [command.userId] },
      clickedBy: { $ne: command.userId },
    }).count();

    return { notifications, total, totalUnclicked };
  },
  setNotificationToClickedBy: async (
    notificationId: string,
    userId: string
  ): Promise<void> => {
    await Notification.updateOne(
      { _id: notificationId },
      { $addToSet: { clickedBy: userId } }
    );
  },
  markAlluserNotificationsAsClicked: async (userId: string): Promise<void> => {
    await Notification.updateMany(
      {
        to: { $all: [userId] },
        clickedBy: { $ne: userId },
      },
      { $addToSet: { clickedBy: userId } }
    );
  },
  deleteByIds: async (notificationIds: string[]): Promise<void> => {
    await Notification.deleteMany({
      _id: { $in: notificationIds.map((n) => new mongoose.Types.ObjectId()) },
    });
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

export default notificationMongooseRepository;
