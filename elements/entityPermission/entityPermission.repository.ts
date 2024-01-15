import mongoose from "mongoose";

import { IEntityEventNotification } from "../entityEventNotification/entityEventNotification.model";
import EntityPermission, { IEntityPermission } from "./entityPermission.model";
import entityEventNotificationRepository from "../entityEventNotification/entityEventNotification.repository";
import {
  IEntityEventNotificationCreateCommand,
  IEntityEventNotificationUpdateCommand,
  IEntityPermissionCreateCommand,
  IEntityPermissionUpdateCommand,
} from "roottypes";

const entityPermissionRepository = {
  createEntityEventNotifications: async (
    command: IEntityEventNotificationCreateCommand[]
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
    command: IEntityEventNotificationUpdateCommand[],
    oldEntityEventNotifications: IEntityEventNotification[]
  ): Promise<IEntityEventNotification[]> => {
    const entityEventNotificationUpdatePromises: Promise<IEntityEventNotification>[] =
      [];
    const updatedEntityEventNotifications: IEntityEventNotification[] = [];

    command.forEach((entityEventNotificationUpdateCommand) => {
      entityEventNotificationUpdatePromises.push(
        new Promise(async (resolve, reject) => {
          try {
            const oldEntityEventNotification:
              | IEntityEventNotification
              | undefined = oldEntityEventNotifications.find(
              (el) =>
                el._id.toString() ===
                entityEventNotificationUpdateCommand._id?.toString()
            );
            if (oldEntityEventNotification) {
              const updatedEntityEventNotification: IEntityEventNotification =
                await entityEventNotificationRepository.update(
                  entityEventNotificationUpdateCommand,
                  oldEntityEventNotification
                );

              updatedEntityEventNotifications.push(
                updatedEntityEventNotification
              );
              resolve(updatedEntityEventNotification);
            }
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
    command: IEntityPermissionCreateCommand
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
      entityUserAssignmentPermissionsByRole: {
        canAssignToUserFromSameRole:
          command.entityUserAssignmentPermissionsByRole
            .canAssignToUserFromSameRole,
        otherRoles: command.entityUserAssignmentPermissionsByRole.otherRolesIds,
      },
    });

    return entityPermission;
  },
  updateEntityPermission: async (
    command: IEntityPermissionUpdateCommand,
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
    const entityEventNotificationsToUpdate: IEntityEventNotificationUpdateCommand[] =
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
    const entityEventNotificationsToCreate: IEntityEventNotificationCreateCommand[] =
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
          entityUserAssignmentPermissionsByRole: {
            canAssignToUserFromSameRole:
              command.entityUserAssignmentPermissionsByRole
                .canAssignToUserFromSameRole,
            otherRoles:
              command.entityUserAssignmentPermissionsByRole.otherRolesIds,
          },
        },
      }
    ).exec();

    const entityPermission: IEntityPermission | null =
      await EntityPermission.findById(command._id);

    if (!entityPermission) {
      throw new Error("Entity permission not found");
    }

    return entityPermission;
  },
  deleteByIds: async (ids: string[]): Promise<void> => {
    for (let i = 0; i < ids.length; i++) {
      await EntityPermission.deleteOne({
        _id: new mongoose.Types.ObjectId(ids[i]),
      });
    }
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
