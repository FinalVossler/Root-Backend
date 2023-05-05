import {
  EventNotificationTrigger,
  StaticPermission,
} from "../entityPermission.model";

type EntityPermissionCreateCommand = {
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

export default EntityPermissionCreateCommand;
