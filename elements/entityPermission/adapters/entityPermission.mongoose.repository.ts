import mongoose from "mongoose";

import EntityPermission from "./entityPermission.mongoose.model";
import entityEventNotificationMongooseRepository from "../../entityEventNotification/adapters/entityEventNotification.mongoose.repository";
import {
  IEntityEventNotificationCreateCommand,
  IEntityEventNotificationUpdateCommand,
  IEntityPermissionCreateCommand,
  IEntityPermissionUpdateCommand,
} from "roottypes";
import IEntityPermissionRepository from "../ports/interfaces/IEntityPermissionRepository";
import IEntityEventNotification from "../../entityEventNotification/ports/interfaces/IEntityEventNotification";
import IEntityPermission from "../ports/interfaces/IEntityPermission";
import IRole from "../../role/ports/interfaces/IRole";
import Role from "../../role/adapters/role.mongoose.model";

const entityPermissionMongooseRepository: IEntityPermissionRepository = {
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
              await entityEventNotificationMongooseRepository.create(
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
                await entityEventNotificationMongooseRepository.update(
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
      await entityPermissionMongooseRepository.createEntityEventNotifications(
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
    await entityEventNotificationMongooseRepository.deleteByIds(
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
      await entityPermissionMongooseRepository.updateEntityEventNotifications(
        entityEventNotificationsToUpdate,
        oldEntityPermission.entityEventNotifications
      );
    // End events to update

    // Start events to create
    const entityEventNotificationsToCreate: IEntityEventNotificationCreateCommand[] =
      command.entityEventNotifications.filter((toAdd) => !toAdd._id);

    const createdEntityEventNotifications: IEntityEventNotification[] =
      await entityPermissionMongooseRepository.createEntityEventNotifications(
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
      const entityPermission: IEntityPermission | null =
        (await EntityPermission.findById(ids[i]).populate({
          path: "entityEventNotifications",
          model: "entityEventNotification",
        })) as IEntityPermission;

      if (!entityPermission) {
        return;
      }

      // Deleting the event notifications from the entity permission that's about to get deleted
      const entityEventNotifications: IEntityEventNotification[] =
        entityPermission.entityEventNotifications;

      await entityEventNotificationMongooseRepository.deleteByIds(
        entityEventNotifications.map((el) => el._id.toString())
      );

      // Delete the entity permission reference from the roles that use them
      const allRoles: IRole[] = await Role.find({}).populate(
        "entityPermissions"
      );
      const roles = allRoles.filter((r) =>
        (r.entityPermissions as IEntityPermission[]).find(
          (e) => e._id.toString() === entityPermission._id.toString()
        )
      );

      for (let i = 0; i < roles.length; i++) {
        const role: IRole = roles[i];

        await Role.updateOne(
          { _id: role._id },
          {
            $set: {
              entityPermissions: (
                role.entityPermissions as IEntityPermission[]
              ).filter(
                (e) => e._id.toString() !== entityPermission._id.toString()
              ),
            },
          }
        );
      }

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

export default entityPermissionMongooseRepository;
