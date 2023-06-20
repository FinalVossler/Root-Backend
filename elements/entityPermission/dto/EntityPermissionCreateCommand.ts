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
  entityUserAssignmentPermissionsByRole: {
    // used to also add the current role that's just been added
    canAssignToUserFromSameRole: boolean;
    otherRolesIds: string[];
  };
  language: string;
};

export default EntityPermissionCreateCommand;
