import EntityEventNotificationCreateCommand from "../../entityEventNotification/dto/EntityEventNotificationCreateCommand";
import { StaticPermission } from "../entityPermission.model";

type EntityPermissionCreateCommand = {
  modelId: string;
  permissions: StaticPermission[];
  entityFieldPermissions: {
    fieldId: string;
    permissions: StaticPermission[];
  }[];
  entityEventNotifications: EntityEventNotificationCreateCommand[];
  language: string;
};

export default EntityPermissionCreateCommand;
