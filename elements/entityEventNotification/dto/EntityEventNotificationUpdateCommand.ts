import { EntityEventNotificationTrigger } from "../entityEventNotification.model";

type EntityEventNotificationUpdateCommand = {
  _id?: string;
  title: string;
  text: string;
  trigger: EntityEventNotificationTrigger;
  language: string;
};

export default EntityEventNotificationUpdateCommand;
