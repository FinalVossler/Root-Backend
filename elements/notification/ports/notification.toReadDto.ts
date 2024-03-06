import { INotificationReadDto } from "roottypes";

import { fileToReadDto } from "../../file/ports/file.toReadDto";
import INotification from "./interfaces/INotification";

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
