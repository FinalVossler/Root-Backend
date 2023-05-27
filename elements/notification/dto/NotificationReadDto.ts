import { INotification } from "../notification.model";

type NotificationReadDto = {
  _id: string;
  text: INotification["text"];
  link: string;
  image: INotification["image"];
  notifiedUser: INotification["notifiedUser"];
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
  notifiedUser: notification.notifiedUser,
  clicked: notification.clicked,

  createdAt: notification.createdAt,
  updatedAt: notification.updatedAt,
});
export default NotificationReadDto;
