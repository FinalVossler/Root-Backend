import {
  IEntityEventNotificationCreateCommand,
  IEntityEventNotificationUpdateCommand,
} from "roottypes";

import IEntityEventNotification from "./IEntityEventNotification";

interface IEntityEventNotificatonRepository {
  create: (
    command: IEntityEventNotificationCreateCommand
  ) => Promise<IEntityEventNotification>;
  update: (
    command: IEntityEventNotificationUpdateCommand,
    oldEntityEventNotification: IEntityEventNotification
  ) => Promise<IEntityEventNotification>;
  deleteByIds: (ids: string[]) => Promise<void>;
}

export default IEntityEventNotificatonRepository;
