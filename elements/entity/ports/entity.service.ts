import {
  EntityEventNotificationTriggerEnum,
  FieldTypeEnum,
  IEntitiesGetCommand,
  IEntitiesSearchCommand,
  IEntitiesSetCustomDataKeyValueCommand,
  IEntityCreateCommand,
  IEntityFieldValueCommand,
  IEntityUpdateCommand,
  StaticPermissionEnum,
  SuperRoleEnum,
} from "roottypes";

import { IField } from "../../field/ports/interfaces/IField";
import IRoleService from "../../role/ports/interfaces/IRoleService";
import IEntityRepository from "./interfaces/IEntityRepository";
import IModelService from "../../model/ports/interfaces/IModelService";
import IUserService from "../../user/ports/interfaces/IUserService";
import IUser from "../../user/ports/interfaces/IUser";
import IModel, { IModelField } from "../../model/ports/interfaces/IModel";
import IRole from "../../role/ports/interfaces/IRole";
import IEntity from "./interfaces/IEntity";
import IEntityService from "./interfaces/IEntityService";
import IEntityEventNotificationService from "../../entityEventNotification/ports/interfaces/IEntityEventNotificationService";
import IEntityPermission from "../../entityPermission/ports/interfaces/IEntityPermission";
import IFile from "../../file/ports/interfaces/IFile";
import IFieldTableElement from "../../fieldTableElement/ports/IFieldTableElement";

const createEntityService = (
  roleService: IRoleService,
  entityRepository: IEntityRepository,
  modelService: IModelService,
  userService: IUserService,
  entityEventNotificationService: IEntityEventNotificationService
): IEntityService => ({
  verifyRequiredFields: async function (
    {
      entityFieldValueCommands,
      modelId,
    }: {
      entityFieldValueCommands: IEntityFieldValueCommand[];
      modelId: string;
    },
    currentUser: IUser
  ): Promise<{
    valid: boolean;
    invalidFields: IModelField[];
    errorText: string;
  }> {
    const model: IModel = await modelService.getById(modelId);

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
  createEntity: async function (
    command: IEntityCreateCommand,
    currentUser: IUser
  ): Promise<IEntity> {
    roleService.checkEntityPermission({
      user: currentUser,
      staticPermission: StaticPermissionEnum.Create,
      modelId: command.modelId.toString(),
    });

    const assignmentPermissionGranted: boolean =
      await this.usersEntityAssignmentPermissionGranted({
        currentUser,
        assignedUsersIds: command.assignedUsersIds,
        modelId: command.modelId.toString(),
      });
    if (!assignmentPermissionGranted) {
      throw new Error("Some user assignments are not allowed");
    }

    // Required fields validation
    const { valid, errorText } = await this.verifyRequiredFields({
      entityFieldValueCommands: command.entityFieldValues,
      modelId: command.modelId.toString(),
    });

    if (!valid) {
      throw new Error(errorText);
    }

    const entity: IEntity = await entityRepository.create(
      command,
      currentUser._id.toString()
    );

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
  updateEntity: async function (
    command: IEntityUpdateCommand,
    currentUser: IUser
  ): Promise<IEntity> {
    roleService.checkEntityPermission({
      user: currentUser,
      staticPermission: StaticPermissionEnum.Update,
      modelId: command.modelId.toString(),
    });

    const oldEntity: IEntity = await this.getById(
      command._id.toString(),
      currentUser
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
      await this.usersEntityAssignmentPermissionGranted({
        currentUser,
        assignedUsersIds: newlyAssignedUsersIds,
        modelId: command.modelId.toString(),
      });
    if (!assignmentPermissionGranted) {
      throw new Error("Some user assignments are not allowed");
    }

    // Required fields validation
    const { valid, errorText } = await this.verifyRequiredFields({
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
    command: IEntitiesGetCommand,
    currentUser: IUser
  ): Promise<{ entities: IEntity[]; total: number }> => {
    roleService.checkEntityPermission({
      user: currentUser,
      staticPermission: StaticPermissionEnum.Read,
      modelId: command.modelId.toString(),
    });

    const { entities, total } = await entityRepository.getEntitiesByModel(
      command
    );

    return { entities, total };
  },
  getAssignedEntitiesByModel: async (
    command: IEntitiesGetCommand,
    currentUser: IUser
  ): Promise<{ entities: IEntity[]; total: number }> => {
    roleService.checkEntityPermission({
      user: currentUser,
      staticPermission: StaticPermissionEnum.Read,
      modelId: command.modelId.toString(),
    });
    const { entities, total } =
      await entityRepository.getAssignedEntitiesByModel(command);

    return { entities, total };
  },
  deleteEntities: async function (
    entitiesIds: string[],
    currentUser: IUser
  ): Promise<void> {
    if (entitiesIds.length > 0) {
      const entity: IEntity | undefined = await entityRepository.getById(
        entitiesIds[0].toString()
      );

      if (!entity) {
        throw new Error("Entity not found");
      }

      roleService.checkEntityPermission({
        user: currentUser,
        staticPermission: StaticPermissionEnum.Read,
        modelId: entity.model._id.toString(),
      });

      await entityRepository.deleteEntities(entitiesIds);
    }
  },
  getById: async (entityId: string, currentUser: IUser): Promise<IEntity> => {
    const entity: IEntity | undefined = await entityRepository.getById(
      entityId
    );

    if (!entity) {
      throw new Error("Entity not found");
    }

    roleService.checkEntityPermission({
      user: currentUser,
      staticPermission: StaticPermissionEnum.Read,
      modelId: entity.model._id.toString(),
    });

    return entity;
  },
  searchEntities: async (
    command: IEntitiesSearchCommand,
    currentUser: IUser
  ): Promise<{ entities: IEntity[]; total: number }> => {
    roleService.checkEntityPermission({
      user: currentUser,
      staticPermission: StaticPermissionEnum.Read,
      modelId: command.modelId.toString(),
    });
    const { entities, total } = await entityRepository.search(command);

    return { entities, total };
  },
  setCustomDataKeyValue: async (
    command: IEntitiesSetCustomDataKeyValueCommand
  ): Promise<void> => {
    await entityRepository.setCustomDataKeyValue(command);
  },
  checkStock: async function (entity: IEntity, reduceBy: number) {
    const model: IModel = await modelService.getById(
      entity.model._id.toString()
    );

    const oldStockAsString: string | undefined = entity.entityFieldValues
      .find(
        (f) =>
          (f.field as IField)._id.toString() ===
          (model.priceField as IField)._id.toString()
      )
      ?.value.at(0)?.text;
    if (!oldStockAsString) {
      throw new Error("Product doesn't have any stock information");
    }

    const oldStock = parseInt(oldStockAsString);

    if (reduceBy > oldStock) {
      throw new Error("Insufficient stock");
    }

    return { model, stock: oldStock };
  },
  reduceStock: async function (entity: IEntity, reduceBy: number) {
    const { model, stock: oldStock } = await this.checkStock(entity, reduceBy);

    const newStock: number = oldStock - reduceBy;

    const command: IEntityUpdateCommand = {
      _id: entity._id.toString(),
      modelId: model._id.toString(),
      assignedUsersIds:
        entity.assignedUsers?.map((u: IUser) => u._id.toString()) || [],
      entityFieldValues: entity.entityFieldValues.map((fieldValue) => ({
        fieldId: (fieldValue.field as IField)._id,
        files: (fieldValue.files as IFile[]).map((file) => ({
          ...file,
        })),
        tableValues:
          fieldValue.tableValues?.map((tableValue) => ({
            columnId: (tableValue.column as IFieldTableElement)._id.toString(),
            rowId: (tableValue.row as IFieldTableElement)._id.toString(),
            value: tableValue.value.at(0)?.text || "",
          })) || [],
        // Here change the stock
        value:
          (fieldValue.field as IField)._id.toString() ===
          (model.priceField as IField)._id.toString()
            ? newStock + ""
            : fieldValue.value.at(0)?.text || "",
        yearTableValues:
          fieldValue.yearTableValues?.map((tableValue) => ({
            rowId: (tableValue.row as IFieldTableElement)._id.toString(),
            values: tableValue.values.map((value) => ({
              year: value.year,
              value: value.value.at(0)?.text || "",
            })),
          })) || [],
      })),
      language: entity.entityFieldValues.at(0)?.value.at(0)?.language || "en",
    };

    await entityRepository.update(command);
  },
});

export default createEntityService;
