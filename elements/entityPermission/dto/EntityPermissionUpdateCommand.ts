import EntityEventNotificationUpdateCommand from "../../entityEventNotification/dto/EntityEventNotificationUpdateCommand";
import { StaticPermission } from "../entityPermission.model";

type EntityPermissionUpdateCommand = {
  _id?: string;
  modelId: string;
  permissions: StaticPermission[];
  entityFieldPermissions: {
    fieldId: string;
    permissions: StaticPermission[];
  }[];
  entityEventNotifications: EntityEventNotificationUpdateCommand[];
  language: string;
};

export default EntityPermissionUpdateCommand;
