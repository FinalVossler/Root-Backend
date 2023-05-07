import { EntityEventNotificationTrigger } from "../entityEventNotification.model";

type EntityEventNotificationCreateCommand = {
  title: string;
  text: string;
  trigger: EntityEventNotificationTrigger;
  language: string;
};

export default EntityEventNotificationCreateCommand;
