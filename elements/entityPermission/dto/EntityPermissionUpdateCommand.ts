import {
  EventNotificationTrigger,
  StaticPermission,
} from "../entityPermission.model";

type EntityPermissionUpdateCommand = {
  modelId: string;
  permissions: StaticPermission[];
  fieldPermissions: {
    fieldId: string;
    permissions: StaticPermission[];
  }[];
  eventNotifications: {
    title: string;
    text: string;
    trigger: EventNotificationTrigger;
  }[];
  language: string;
};

export default EntityPermissionUpdateCommand;
