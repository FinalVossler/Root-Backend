import mongoose from "mongoose";

import EntityEventNotification, {
  IEntityEventNotification,
} from "../entityEventNotification/entityEventNotification.model";
import EntityPermissionCreateCommand from "./dto/EntityPermissionCreateCommand";
import EntityPermissionUpdateCommand from "./dto/EntityPermissionUpdateCommand";
import EntityPermission, { IEntityPermission } from "./entityPermission.model";
import EntityEventNotificationCreateCommand from "../entityEventNotification/dto/EntityEventNotificationCreateCommand";
import EntityEventNotificationUpdateCommand from "../entityEventNotification/dto/EntityEventNotificationUpdateCommand";
import entityEventNotificationRepository from "../entityEventNotification/entityEventNotification.repository";

const entityPermissionRepository = {
  createEntityEventNotifications: async (
    command: EntityEventNotificationCreateCommand[]
  ): Promise<IEntityEventNotification[]> => {
    const entityEventNotificationCreationPromises: Promise<IEntityEventNotification>[] =
      [];
    const createdEntityEventNotifications: IEntityEventNotification[] = [];

    command.forEach((entityEventNotificationCreateCommand) => {
      entityEventNotificationCreationPromises.push(
        new Promise(async (resolve, reject) => {
          try {
            const createdEntityEventNotification: IEntityEventNotification =
              await entityEventNotificationRepository.create(
                entityEventNotificationCreateCommand
              );
            createdEntityEventNotifications.push(
              createdEntityEventNotification
            );
            resolve(createdEntityEventNotification);
          } catch (e) {
            reject(e);
          }
        })
      );
    });

    await Promise.all(entityEventNotificationCreationPromises);

    return createdEntityEventNotifications;
  },
  updateEntityEventNotifications: async (
    command: EntityEventNotificationUpdateCommand[],
    oldEntityEventNotifications: IEntityEventNotification[]
  ): Promise<IEntityEventNotification[]> => {
    const entityEventNotificationUpdatePromises: Promise<IEntityEventNotification>[] =
      [];
    const updatedEntityEventNotifications: IEntityEventNotification[] = [];

    command.forEach((entityEventNotificationUpdateCommand) => {
      entityEventNotificationUpdatePromises.push(
        new Promise(async (resolve, reject) => {
          try {
            const updatedEntityEventNotification: IEntityEventNotification =
              await entityEventNotificationRepository.update(
                entityEventNotificationUpdateCommand,
                oldEntityEventNotifications.find(
                  (el) =>
                    el._id.toString() ===
                    entityEventNotificationUpdateCommand._id
                )
              );

            updatedEntityEventNotifications.push(
              updatedEntityEventNotification
            );
            resolve(updatedEntityEventNotification);
          } catch (e) {
            reject(e);
          }
        })
      );
    });

    await Promise.all(entityEventNotificationUpdatePromises);

    return updatedEntityEventNotifications;
  },
  create: async (
    command: EntityPermissionCreateCommand
  ): Promise<IEntityPermission> => {
    const entityEventNotifications: IEntityEventNotification[] =
      await entityPermissionRepository.createEntityEventNotifications(
        command.entityEventNotifications
      );

    const entityPermission: IEntityPermission = await EntityPermission.create({
      model: command.modelId,
      permissions: command.permissions.map((p) => p.toString()),
      entityFieldPermissions: command.entityFieldPermissions.map(
        (entityFieldPermission) => ({
          field: entityFieldPermission.fieldId,
          permissions: entityFieldPermission.permissions,
        })
      ),
      entityEventNotifications: entityEventNotifications,
    });

    return entityPermission;
  },
  updateEntityPermission: async (
    command: EntityPermissionUpdateCommand,
    oldEntityPermission: IEntityPermission
  ): Promise<IEntityPermission> => {
    // Start events to delete
    const entityEventNotificationsToDelete: IEntityEventNotification[] =
      oldEntityPermission.entityEventNotifications.filter(
        (existing) =>
          !command.entityEventNotifications.find(
            (toAdd) => toAdd._id === existing._id.toString()
          )
      );
    await entityEventNotificationRepository.deleteByIds(
      entityEventNotificationsToDelete.map((el) => el._id.toString())
    );
    // End events to delete

    // Start events to update
    const entityEventNotificationsToUpdate: EntityEventNotificationUpdateCommand[] =
      command.entityEventNotifications.filter((toAdd) =>
        oldEntityPermission.entityEventNotifications.find(
          (existing) => existing._id.toString() === toAdd._id
        )
      );
    const updatedEntityEventNotifications: IEntityEventNotification[] =
      await entityPermissionRepository.updateEntityEventNotifications(
        entityEventNotificationsToUpdate,
        oldEntityPermission.entityEventNotifications
      );
    // End events to update

    // Start events to create
    const entityEventNotificationsToCreate: EntityEventNotificationCreateCommand[] =
      command.entityEventNotifications.filter((toAdd) => !toAdd._id);

    const createdEntityEventNotifications: IEntityEventNotification[] =
      await entityPermissionRepository.createEntityEventNotifications(
        entityEventNotificationsToCreate
      );
    // End events to create

    await EntityPermission.updateOne(
      {
        _id: command._id,
      },
      {
        $set: {
          model: command.modelId,
          permissions: command.permissions.map((p) => p.toString()),
          entityFieldPermissions: command.entityFieldPermissions.map(
            (entityFieldPermission) => ({
              field: entityFieldPermission.fieldId,
              permissions: entityFieldPermission.permissions,
            })
          ),
          entityEventNotifications: [
            ...updatedEntityEventNotifications,
            ...createdEntityEventNotifications,
          ],
        },
      }
    ).exec();

    const entityPermission: IEntityPermission = await EntityPermission.findById(
      command._id
    );

    return entityPermission;
  },
  deleteByIds: async (ids: string[]): Promise<void> => {
    await EntityPermission.deleteMany({
      _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
    });
  },
  getModelEntityPermissions: async (
    modelId: string
  ): Promise<IEntityPermission[]> => {
    const entityPermissions: IEntityPermission[] = await EntityPermission.find({
      model: new mongoose.Types.ObjectId(modelId),
    });

    return entityPermissions;
  },
};

export default entityPermissionRepository;
