import { IEntityEventNotificationReadDto } from "roottypes";
import IEntityEventNotification from "./interfaces/IEntityEventNotification";

export const entityEventNotificationToReadDto = (
  entityEventNotification: IEntityEventNotification
): IEntityEventNotificationReadDto => {
  return {
    _id: entityEventNotification._id.toString(),
    text: entityEventNotification.text,
    title: entityEventNotification.title,
    trigger: entityEventNotification.trigger,
  };
};
