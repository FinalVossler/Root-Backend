import mongoose from "mongoose";

import { IEntity } from "./entity.model";
import EntitiesGetCommand from "./dto/EntitiesGetCommand";
import entityRepository from "./entity.repository";
import EntityCreateCommand, {
  EntityFieldValueCommand,
} from "./dto/EntityCreateCommand";
import EntityUpdateCommand from "./dto/EntityUpdateCommand";
import { IUser, SuperRole } from "../user/user.model";
import EntitiesSearchCommand from "./dto/EntitiesSearchCommand";
import entityEventNotificationService from "../entityEventNotification/entityEventNotification.service";
import { EntityEventNotificationTrigger } from "../entityEventNotification/entityEventNotification.model";
import { IModel, IModelField } from "../model/model.model";
import modelSerivce from "../model/model.service";
import { FieldType } from "../field/field.model";
import userService from "../user/user.service";
import { IEntityPermission } from "../entityPermission/entityPermission.model";
import NotificationCreateCommand from "../notification/dto/NotificationCreateCommand";
import notificationService from "../notification/notification.service";

const entityService = {
  verifyRequiredFields: async ({
    entityFieldValueCommands,
    modelId,
  }: {
    entityFieldValueCommands: EntityFieldValueCommand[];
    modelId: string;
  }): Promise<{
    valid: boolean;
    invalidFields: IModelField[];
    errorText: string;
  }> => {
    const model: IModel = await modelSerivce.getById(modelId);

    const invalidFields: IModelField[] = [];

    model.modelFields.forEach((modelField: IModelField) => {
      const commandField: EntityFieldValueCommand =
        entityFieldValueCommands.find(
          (el) => el.fieldId.toString() === modelField.field._id.toString()
        );

      if (modelField.required) {
        if (!commandField) {
          invalidFields.push(modelField);
        } else if (modelField.field.type === FieldType.File) {
          if (!commandField.files || commandField.files.length === 0) {
            invalidFields.push(modelField);
          }
        } else {
          if (
            commandField.value === null ||
            commandField.value === undefined ||
            commandField.value === ""
          ) {
            invalidFields.push(modelField);
          }
        }
      }
    });

    const errorText: string =
      invalidFields.length === 0
        ? ""
        : "required fields: " +
          invalidFields
            .map((modelField: IModelField) =>
              modelField.field.name.length > 0
                ? modelField.field.name[0].text
                : modelField.field._id.toString()
            )
            .join(",");

    return { valid: invalidFields.length === 0, invalidFields, errorText };
  },
  usersEntityAssignmentPermissionGranted: async ({
    currentUser,
    assignedUsersIds,
    modelId,
  }: {
    currentUser: IUser;
    assignedUsersIds: string[];
    modelId: string;
  }): Promise<boolean> => {
    if (currentUser.superRole === SuperRole.SuperAdmin) {
      return true;
    }

    let hasPermission: boolean = true;

    const users: IUser[] = await userService.getByIds(assignedUsersIds);

    const currentUserEntityPermissions: IEntityPermission | undefined =
      currentUser.role?.entityPermissions.find(
        (e) => e.model._id.toString() === modelId.toString()
      );

    if (!currentUserEntityPermissions && assignedUsersIds.length > 0) {
      return false;
    } else {
      users.forEach((user) => {
        if (
          user.role?._id.toString() === currentUser.role?._id.toString() &&
          !currentUserEntityPermissions.entityUserAssignmentPermissionsByRole
            .canAssignToUserFromSameRole &&
          !currentUserEntityPermissions.entityUserAssignmentPermissionsByRole.otherRoles.some(
            (r) => r._id.toString() === currentUser.role?._id.toString()
          )
        ) {
          hasPermission = false;
        } else if (
          user.role?._id.toString() !== currentUser.role?._id.toString() &&
          !currentUserEntityPermissions.entityUserAssignmentPermissionsByRole.otherRoles.some(
            (r) => r._id.toString() === user.role?._id.toString()
          )
        ) {
          hasPermission = false;
        }
      });
    }

    return hasPermission;
  },
  createEntity: async (
    command: EntityCreateCommand,
    currentUser: IUser
  ): Promise<IEntity> => {
    const entity: IEntity = await entityRepository.create(command);

    const assignmentPermissionGranted: boolean =
      await entityService.usersEntityAssignmentPermissionGranted({
        currentUser,
        assignedUsersIds: command.assignedUsersIds,
        modelId: command.modelId.toString(),
      });
    if (!assignmentPermissionGranted) {
      throw new Error("Some user assignments are not allowed");
    }

    // Required fields validation
    const { valid, errorText } = await entityService.verifyRequiredFields({
      entityFieldValueCommands: command.entityFieldValues,
      modelId: command.modelId.toString(),
    });

    if (!valid) {
      throw new Error(errorText);
    }

    // Now send the onCreate event notificatiosn (email + inapp notifications)
    entityEventNotificationService.notifyUsers(
      command.modelId.toString(),
      EntityEventNotificationTrigger.OnCreate,
      entity,
      currentUser
    );

    // Now send the onAssigned event notificatiosn (email + inapp notifications)
    if (command.assignedUsersIds.length > 0) {
      entityEventNotificationService.notifyUsers(
        command.modelId.toString(),
        EntityEventNotificationTrigger.OnAssigned,
        entity,
        currentUser,
        command.assignedUsersIds
      );
    }

    return entity;
  },
  updateEntity: async (
    command: EntityUpdateCommand,
    currentUser: IUser
  ): Promise<IEntity> => {
    const oldEntity: IEntity = await entityService.getById(
      command._id.toString()
    );
    const oldAssignedUsers = [...(oldEntity.assignedUsers || [])];

    const newlyAssignedUsersIds = command.assignedUsersIds.filter(
      (assignedNow) =>
        !oldAssignedUsers.some((u) => u._id.toString() === assignedNow)
    );
    const entity: IEntity = await entityRepository.update(command, currentUser);

    const assignmentPermissionGranted: boolean =
      await entityService.usersEntityAssignmentPermissionGranted({
        currentUser,
        assignedUsersIds: command.assignedUsersIds,
        modelId: command.modelId.toString(),
      });
    if (!assignmentPermissionGranted) {
      throw new Error("Some user assignments are not allowed");
    }

    // Required fields validation
    const { valid, errorText } = await entityService.verifyRequiredFields({
      entityFieldValueCommands: command.entityFieldValues,
      modelId: command.modelId.toString(),
    });

    if (!valid) {
      throw new Error(errorText);
    }

    // Now send the onAssigned event notificatiosn (email + inapp notifications)
    if (newlyAssignedUsersIds.length > 0) {
      if (command.assignedUsersIds.length > 0) {
        entityEventNotificationService.notifyUsers(
          command.modelId.toString(),
          EntityEventNotificationTrigger.OnAssigned,
          entity,
          currentUser,
          newlyAssignedUsersIds
        );
      }
    }

    return entity;
  },
  getEntitiesByModel: async (
    command: EntitiesGetCommand
  ): Promise<{ entities: IEntity[]; total: number }> => {
    const { entities, total } = await entityRepository.getEntitiesByModel(
      command
    );

    return { entities, total };
  },
  deleteEntities: async (entitiesIds: mongoose.ObjectId[]): Promise<void> => {
    await entityRepository.deleteEntities(entitiesIds);
  },
  getById: async (entityId: string): Promise<IEntity> => {
    return await entityRepository.getById(entityId);
  },
  search: async (
    command: EntitiesSearchCommand
  ): Promise<{ entities: IEntity[]; total: number }> => {
    const { entities, total } = await entityRepository.search(command);

    return { entities, total };
  },
};

export default entityService;
