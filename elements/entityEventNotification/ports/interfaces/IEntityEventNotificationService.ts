import { EntityEventNotificationTriggerEnum } from "roottypes";
import IEntity from "../../../entity/ports/interfaces/IEntity";
import IUser from "../../../user/ports/interfaces/IUser";

interface IEntityEventNotificationService {
  notifyUsers: (
    modelId: string,
    trigger: EntityEventNotificationTriggerEnum,
    entity: IEntity,
    currentUser: IUser,
    usersIdsToNotify?: string[]
  ) => Promise<void>;
}

export default IEntityEventNotificationService;
