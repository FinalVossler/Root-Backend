import {
  IEntityEventNotificationCreateCommand,
  IEntityEventNotificationUpdateCommand,
  IEntityPermissionCreateCommand,
  IEntityPermissionUpdateCommand,
} from "roottypes";

import IEntityEventNotification from "../../../entityEventNotification/ports/interfaces/IEntityEventNotification";
import IEntityPermission from "./IEntityPermission";

interface IEntityPermissionRepository {
  createEntityEventNotifications: (
    command: IEntityEventNotificationCreateCommand[]
  ) => Promise<IEntityEventNotification[]>;
  updateEntityEventNotifications: (
    command: IEntityEventNotificationUpdateCommand[],
    oldEntityEventNotifications: IEntityEventNotification[]
  ) => Promise<IEntityEventNotification[]>;
  create: (
    command: IEntityPermissionCreateCommand
  ) => Promise<IEntityPermission>;
  updateEntityPermission: (
    command: IEntityPermissionUpdateCommand,
    oldEntityPermission: IEntityPermission
  ) => Promise<IEntityPermission>;
  deleteByIds: (ids: string[]) => Promise<void>;
  getModelEntityPermissions: (modelId: string) => Promise<IEntityPermission[]>;
}

export default IEntityPermissionRepository;
