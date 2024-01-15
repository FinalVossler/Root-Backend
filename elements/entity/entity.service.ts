import { IEntity } from "./entity.model";
import entityRepository from "./entity.repository";
import { IUser } from "../user/user.model";
import entityEventNotificationService from "../entityEventNotification/entityEventNotification.service";
import { IModel, IModelField } from "../model/model.model";
import modelSerivce from "../model/model.service";
import userService from "../user/user.service";
import { IEntityPermission } from "../entityPermission/entityPermission.model";
import {
  EntityEventNotificationTriggerEnum,
  FieldTypeEnum,
  IEntitiesGetCommand,
  IEntitiesSearchCommand,
  IEntitiesSetCustomDataKeyValueCommand,
  IEntityCreateCommand,
  IEntityFieldValueCommand,
  IEntityUpdateCommand,
  SuperRoleEnum,
} from "roottypes";
import { IRole } from "../role/role.model";
import { IField } from "../field/field.model";

const entityService = {
  verifyRequiredFields: async ({
    entityFieldValueCommands,
    modelId,
  }: {
    entityFieldValueCommands: IEntityFieldValueCommand[];
    modelId: string;
  }): Promise<{
    valid: boolean;
    invalidFields: IModelField[];
    errorText: string;
  }> => {
    const model: IModel = await modelSerivce.getById(modelId);

    const invalidFields: IModelField[] = [];

    model.modelFields.forEach((modelField: IModelField) => {
      const commandField: IEntityFieldValueCommand | undefined =
        entityFieldValueCommands.find(
          (el) =>
            el.fieldId.toString() ===
            (modelField.field as IField)._id.toString()
        );

      if (modelField.required) {
        if (!commandField) {
          invalidFields.push(modelField);
        } else if ((modelField.field as IField).type === FieldTypeEnum.File) {
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
              (modelField.field as IField).name.length > 0
                ? (modelField.field as IField).name[0].text
                : (modelField.field as IField)._id.toString()
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
    if (currentUser.superRole === SuperRoleEnum.SuperAdmin) {
      return true;
    }

    let hasPermission: boolean = true;

    const users: IUser[] = await userService.getByIds(assignedUsersIds);

    const currentUserEntityPermissions: IEntityPermission | undefined = (
      (currentUser.role as IRole)?.entityPermissions as IEntityPermission[]
    ).find((e) => (e.model as IModel)._id.toString() === modelId.toString());

    if (!currentUserEntityPermissions && assignedUsersIds.length > 0) {
      return false;
    } else {
      users.forEach((user) => {
        if (
          (user.role as IRole)?._id.toString() ===
            (currentUser.role as IRole)?._id.toString() &&
          !currentUserEntityPermissions?.entityUserAssignmentPermissionsByRole
            ?.canAssignToUserFromSameRole &&
          !currentUserEntityPermissions?.entityUserAssignmentPermissionsByRole?.otherRoles.some(
            (r) =>
              (r as IRole)._id.toString() ===
              (currentUser.role as IRole)?._id.toString()
          )
        ) {
          hasPermission = false;
        } else if (
          (user.role as IRole)?._id.toString() !==
            (currentUser.role as IRole)?._id.toString() &&
          !currentUserEntityPermissions?.entityUserAssignmentPermissionsByRole?.otherRoles.some(
            (r) =>
              (r as IRole)._id.toString() ===
              (user.role as IRole)?._id.toString()
          )
        ) {
          hasPermission = false;
        }
      });
    }

    return hasPermission;
  },
  createEntity: async (
    command: IEntityCreateCommand,
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

    // Now send the onCreate event notifications (email + in app notifications)
    entityEventNotificationService.notifyUsers(
      command.modelId.toString(),
      EntityEventNotificationTriggerEnum.OnCreate,
      entity,
      currentUser
    );

    // Now send the onAssigned event notifications (email + in app notifications)
    if (command.assignedUsersIds.length > 0) {
      entityEventNotificationService.notifyUsers(
        command.modelId.toString(),
        EntityEventNotificationTriggerEnum.OnAssigned,
        entity,
        currentUser,
        command.assignedUsersIds
      );
    }

    return entity;
  },
  updateEntity: async (
    command: IEntityUpdateCommand,
    currentUser: IUser
  ): Promise<IEntity> => {
    const oldEntity: IEntity = await entityService.getById(
      command._id.toString()
    );
    const oldAssignedUsers = [...(oldEntity.assignedUsers || [])];

    const newlyAssignedUsersIds = command.assignedUsersIds.filter(
      (assignedNow) =>
        !oldAssignedUsers.some(
          (u) => (u as IUser)._id.toString() === assignedNow
        )
    );
    const entity: IEntity = await entityRepository.update(command);

    const assignmentPermissionGranted: boolean =
      await entityService.usersEntityAssignmentPermissionGranted({
        currentUser,
        assignedUsersIds: newlyAssignedUsersIds,
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
          EntityEventNotificationTriggerEnum.OnAssigned,
          entity,
          currentUser,
          newlyAssignedUsersIds
        );
      }
    }

    return entity;
  },
  getEntitiesByModel: async (
    command: IEntitiesGetCommand
  ): Promise<{ entities: IEntity[]; total: number }> => {
    const { entities, total } = await entityRepository.getEntitiesByModel(
      command
    );

    return { entities, total };
  },
  getAssignedEntitiesByModel: async (
    command: IEntitiesGetCommand
  ): Promise<{ entities: IEntity[]; total: number }> => {
    const { entities, total } =
      await entityRepository.getAssignedEntitiesByModel(command);

    return { entities, total };
  },
  deleteEntities: async (entitiesIds: string[]): Promise<void> => {
    await entityRepository.deleteEntities(entitiesIds);
  },
  getById: async (entityId: string): Promise<IEntity> => {
    const entity: IEntity | undefined = await entityRepository.getById(
      entityId
    );

    if (!entity) {
      throw new Error("Entity not found");
    }

    return entity;
  },
  search: async (
    command: IEntitiesSearchCommand
  ): Promise<{ entities: IEntity[]; total: number }> => {
    const { entities, total } = await entityRepository.search(command);

    return { entities, total };
  },
  setCustomDataKeyValue: async (
    command: IEntitiesSetCustomDataKeyValueCommand
  ): Promise<void> => {
    await entityRepository.setCustomDataKeyValue(command);
  },
};

export default entityService;
