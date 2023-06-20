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
  entityUserAssignmentPermissionsByRole: {
    // used to also add the current role that's just been added
    canAssignToUserFromSameRole: boolean;
    otherRolesIds: string[];
  };
  language: string;
};

export default EntityPermissionUpdateCommand;
