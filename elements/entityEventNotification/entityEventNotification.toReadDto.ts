import { IEntityEventNotificationReadDto } from "roottypes";
import { IEntityEventNotification } from "./entityEventNotification.model";

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
