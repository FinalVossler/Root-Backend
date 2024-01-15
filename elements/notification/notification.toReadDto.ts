import { INotificationReadDto } from "roottypes";
import { INotification } from "./notification.model";
import { fileToReadDto } from "../file/file.toReadDto";

export const notificationToReadDto = (
  notification: INotification
): INotificationReadDto => ({
  _id: notification._id.toString(),
  text: notification.text,
  link: notification.link,
  image: notification.image ? fileToReadDto(notification.image) : undefined,
  to: notification.to.map((to) => to.toString()),
  clickedBy: notification.clickedBy.map((clickedBy) => clickedBy.toString()),

  createdAt: notification.createdAt,
  updatedAt: notification.updatedAt,
});
