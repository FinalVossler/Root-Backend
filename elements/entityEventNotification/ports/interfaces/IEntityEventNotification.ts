import { EntityEventNotificationTriggerEnum, ITranslatedText } from "roottypes";

export default interface IEntityEventNotification {
  _id: string;
  title: ITranslatedText[];
  text: ITranslatedText[];
  trigger: EntityEventNotificationTriggerEnum;
}
