import { INotification } from "../notification.model";

type NotificationReadDto = {
  _id: string;
  text: INotification["text"];
  link: string;
  image: INotification["image"];
  to: INotification["to"];
  clicked: INotification["clicked"];

  createdAt: INotification["createdAt"];
  updatedAt: INotification["updatedAt"];
};

export const toReadDto = (
  notification: INotification
): NotificationReadDto => ({
  _id: notification._id.toString(),
  text: notification.text,
  link: notification.link,
  image: notification.image,
  to: notification.to,
  clicked: notification.clicked,

  createdAt: notification.createdAt,
  updatedAt: notification.updatedAt,
});
export default NotificationReadDto;
