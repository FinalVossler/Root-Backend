import {
  EntityEventNotificationTriggerEnum,
  FieldTypeEnum,
  IEntitiesGetCommand,
  IEntitiesSearchCommand,
  IEntitiesSetCustomDataKeyValueCommand,
  IEntityCreateCommand,
  IEntityFieldValueCommand,
  IEntityUpdateCommand,
  EntityStaticPermissionEnum,
  SuperRoleEnum,
  IUserReadDto,
} from "roottypes";
import _ from "lodash";

import { IField, IFieldOption } from "../../field/ports/interfaces/IField";
import IRoleService from "../../role/ports/interfaces/IRoleService";
import IEntityRepository from "./interfaces/IEntityRepository";
import IModelService from "../../model/ports/interfaces/IModelService";
import IUserService from "../../user/ports/interfaces/IUserService";
import IUser from "../../user/ports/interfaces/IUser";
import IModel, { IModelField } from "../../model/ports/interfaces/IModel";
import IRole from "../../role/ports/interfaces/IRole";
import IEntity, { IEntityFieldValue } from "./interfaces/IEntity";
import IEntityService from "./interfaces/IEntityService";
import IEntityEventNotificationService from "../../entityEventNotification/ports/interfaces/IEntityEventNotificationService";
import IEntityPermission from "../../entityPermission/ports/interfaces/IEntityPermission";
import IFile from "../../file/ports/interfaces/IFile";
import IFieldTableElement from "../../fieldTableElement/ports/IFieldTableElement";
import { getElement, getElementId } from "../../../utils/getElement";
import IOrderRepository from "../../ecommerce/order/ports/interfaces/IOrderRepository";
import { orderService } from "../../../ioc";
import IOrderService from "../../ecommerce/order/ports/interfaces/IOrderService";

const createEntityService = (
  roleService: IRoleService,
  entityRepository: IEntityRepository,
  modelService: IModelService,
  userService: IUserService,
  entityEventNotificationService: IEntityEventNotificationService,
  orderRepository: IOrderRepository
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
    const model = await modelService.getById(modelId);

    if (!model) {
      throw new Error("model not found");
    }

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
      staticPermission: EntityStaticPermissionEnum.Create,
      modelId: command.modelId.toString(),
    });

    // Only check user assignment permissions when aren't adding an entity that concerns orders;
    // Because we are using the user assignment functonality to send notifications when an order information is created or updated.
    const model = await modelService.getById(command.modelId);
    if (!model?.isForOrders) {
      const assignmentPermissionGranted: boolean = await (
        this as IEntityService
      ).usersEntityAssignmentPermissionGranted({
        currentUser,
        assignedUsersIds: command.assignedUsersIds,
        modelId: command.modelId.toString(),
      });
      if (!assignmentPermissionGranted) {
        throw new Error("Some user assignments are not allowed");
      }
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
    const { entity: oldEntity } = await (this as IEntityService).getById(
      command._id.toString(),
      currentUser
    );

    roleService.checkEntityPermission({
      user: currentUser,
      staticPermission: EntityStaticPermissionEnum.Update,
      modelId: command.modelId.toString(),

      entitiesOwners: [oldEntity.owner],
      ownerPermission: EntityStaticPermissionEnum.UpdateOwn,
    });

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

    // Now send the onUpdate event notifications
    entityEventNotificationService.notifyUsers(
      command.modelId.toString(),
      EntityEventNotificationTriggerEnum.OnUpdate,
      entity,
      currentUser
    );

    // Now send the onAssigned event notifications (email + inapp notifications)
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

    // send the onUpdateWhenAssigned event notifications to old assigned users
    if (oldAssignedUsers.length > 0) {
      entityEventNotificationService.notifyUsers(
        command.modelId.toString(),
        EntityEventNotificationTriggerEnum.OnUpdateWhenAssigned,
        entity,
        currentUser,
        oldAssignedUsers.map((el) => getElementId(el))
      );
    }

    return entity;
  },
  getEntitiesByModel: async (
    command: IEntitiesGetCommand,
    currentUser: IUser
  ): Promise<{ entities: IEntity[]; total: number }> => {
    roleService.checkEntityPermission({
      user: currentUser,
      staticPermission: EntityStaticPermissionEnum.Read,
      modelId: command.modelId.toString(),

      ownerPermission: EntityStaticPermissionEnum.ReadOwn,
    });

    if (
      roleService.hasEntityPermission({
        user: currentUser,
        staticPermission: EntityStaticPermissionEnum.Read,
        modelId: command.modelId.toString(),
      })
    ) {
      const { entities, total } = await entityRepository.getEntitiesByModel(
        command
      );

      return { entities, total };
    } else {
      const { entities, total } = await entityRepository.getEntitiesByModel(
        command,
        currentUser._id.toString()
      );

      return { entities, total };
    }
  },
  getAssignedEntitiesByModel: async (
    command: IEntitiesGetCommand,
    currentUser: IUser
  ): Promise<{ entities: IEntity[]; total: number }> => {
    roleService.checkEntityPermission({
      user: currentUser,
      staticPermission: EntityStaticPermissionEnum.Read,
      modelId: command.modelId.toString(),

      ownerPermission: EntityStaticPermissionEnum.ReadOwn,
    });

    if (
      roleService.hasEntityPermission({
        user: currentUser,
        staticPermission: EntityStaticPermissionEnum.Read,
        modelId: command.modelId.toString(),
      })
    ) {
      const { entities, total } =
        await entityRepository.getAssignedEntitiesByModel(command);

      return { entities, total };
    } else {
      const { entities, total } =
        await entityRepository.getAssignedEntitiesByModel(
          command,
          currentUser._id.toString()
        );

      return { entities, total };
    }
  },
  deleteEntities: async function (
    entitiesIds: string[],
    currentUser: IUser
  ): Promise<void> {
    if (entitiesIds.length > 0) {
      const entities: IEntity[] = await entityRepository.getUnpopulatedByIds(
        entitiesIds
      );

      roleService.checkEntityPermission({
        user: currentUser,
        staticPermission: EntityStaticPermissionEnum.Delete,
        modelId:
          typeof entities[0].model === "string"
            ? entities[0].model
            : entities[0].model._id.toString(),

        entitiesOwners: entities.map((e) => e.owner),
        ownerPermission: EntityStaticPermissionEnum.DeleteOwn,
      });

      //#region If an entity is used for an order, then prevent deleting it
      const numberOfOrdersWithEntitiesWeAreAboutToDelete =
        await orderRepository.getNumberOfOrdersWithEntities(entitiesIds);
      if (numberOfOrdersWithEntitiesWeAreAboutToDelete > 0) {
        throw new Error(
          "Some orders have been created created based on these entities"
        );
      }
      //#region If an entity is used for an order, then prevent deleting it

      for (let i = 0; i < entities.length; i++) {
        //#region Update the parent of children entities which parent is set to one of the entities we are about to delete.
        const entity = entities[i];

        const children: IEntity[] = await (
          this as IEntityService
        ).getEntityChildren(entity._id.toString());

        // Find a child that doesn't belong to the list of entities we are about to delete
        const safeChild: IEntity | undefined = children.find(
          (e) => entitiesIds.indexOf(e._id.toString()) === -1
        );

        if (safeChild) {
          // Set the parent of other children to the safe child
          await entityRepository.updateEntitiesParents(
            children
              .filter((c) => c._id.toString() !== safeChild._id.toString())
              .map((e) => e._id.toString()),
            safeChild._id.toString()
          );

          // Set the safe child parent to null, because it's itself a parent now
          await entityRepository.updateEntitiesParents(
            [safeChild._id.toString()],
            null
          );
        }
        //#endregion Update the parent of children entities which parent is set to one of the entities we are about to delete.
      }

      await entityRepository.deleteEntities(entitiesIds);
    }
  },
  getById: async (entityId: string, currentUser: IUser) => {
    const entity: IEntity | undefined = await entityRepository.getById(
      entityId
    );

    if (!entity) {
      throw new Error("Entity not found");
    }

    roleService.checkEntityPermission({
      user: currentUser,
      staticPermission: EntityStaticPermissionEnum.Read,
      modelId: getElementId(entity.model),

      ownerPermission: EntityStaticPermissionEnum.Read,
      entitiesOwners: [entity.owner],
    });

    const concernedOrder =
      getElement(entity.model).isForOrders &&
      entity.orderAssociationConfig?.orderId
        ? await orderService.getOrderById(entity.orderAssociationConfig.orderId)
        : undefined;

    return { entity, concernedOrder };
  },

  getByIdWithUncheckedPermissions: async (
    entityId: string
  ): Promise<IEntity> => {
    const entity: IEntity | undefined = await entityRepository.getById(
      entityId
    );

    if (!entity) {
      throw new Error("Entity not found");
    }

    return entity;
  },
  searchEntities: async (
    command: IEntitiesSearchCommand,
    currentUser: IUser
  ): Promise<{ entities: IEntity[]; total: number }> => {
    roleService.checkEntityPermission({
      user: currentUser,
      staticPermission: EntityStaticPermissionEnum.Read,
      modelId: command.modelId.toString(),
    });
    if (
      roleService.hasEntityPermission({
        user: currentUser,
        staticPermission: EntityStaticPermissionEnum.Read,
        modelId: command.modelId.toString(),
      })
    ) {
      const { entities, total } = await entityRepository.search(command);

      return { entities, total };
    } else {
      const { entities, total } = await entityRepository.search(
        command,
        currentUser._id.toString()
      );

      return { entities, total };
    }
  },
  setCustomDataKeyValue: async (
    command: IEntitiesSetCustomDataKeyValueCommand
  ): Promise<void> => {
    await entityRepository.setCustomDataKeyValue(command);
  },
  checkStock: async function (entity: IEntity, reduceBy: number) {
    const model = await modelService.getById(getElementId(entity.model));

    if (!model) {
      throw new Error("Entity model not found");
    }

    const oldStockAsString: string | undefined = entity.entityFieldValues
      .find(
        (f) =>
          (f.field as IField)._id.toString() ===
          (model.quantityField as IField)._id.toString()
      )
      ?.value.at(0)?.text;
    if (!oldStockAsString) {
      throw new Error("Product doesn't have any stock information");
    }

    const oldStock = parseInt(oldStockAsString);

    if (reduceBy > oldStock) {
      throw new Error(
        "Insufficient stock => old stock=" +
          oldStock +
          ", reduce by=" +
          reduceBy
      );
    }

    return { model, stock: oldStock };
  },
  reduceStock: async function (entity: IEntity, reduceBy: number) {
    const { model, stock: oldStock } = await (
      this as IEntityService
    ).checkStock(entity, reduceBy);

    const newStock: number = oldStock - reduceBy;

    const command: IEntityUpdateCommand = {
      _id: entity._id.toString(),
      modelId: model._id.toString(),
      assignedUsersIds:
        entity.assignedUsers?.map((u: IUser) => u._id.toString()) || [],
      entityFieldValues: entity.entityFieldValues.map((fieldValue) => ({
        fieldId: (fieldValue.field as IField)._id,
        files: (fieldValue.files as IFile[]).map((file) => ({
          _id: file._id,
          isImage: file.isImage,
          name: file.name,
          ownerId: file.ownerId,
          url: file.url,
          uuid: file.uuid,
          // ...file,
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
          (model.quantityField as IField)._id.toString()
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
  copyEntities: async function (
    modelId: string,
    entitiesIds: string[],
    currentUser: IUser
  ) {
    roleService.checkEntityPermission({
      user: currentUser,
      modelId,
      staticPermission: EntityStaticPermissionEnum.Create,
    });

    const copiedEntities = await entityRepository.copyEntities(entitiesIds);

    return copiedEntities;
  },
  generateVariations: async (entityId: string, currentUser: IUser) => {
    const entity = await entityRepository.getById(entityId);

    if (!entity) {
      throw new Error("Entity not found");
    }
    roleService.checkEntityPermission({
      user: currentUser,
      modelId: getElementId(entity.model),
      staticPermission: EntityStaticPermissionEnum.Create,
    });

    const model = await modelService.getById(getElementId(entity.model));

    if (!model) {
      throw new Error("Entity model not found");
    }

    const variationFields: IField[] = model.modelFields
      .filter((modelField) => {
        return (
          getElement(modelField.field).type === FieldTypeEnum.Selector &&
          modelField.isVariation
        );
      })
      .map((modelField) => getElement(modelField.field));

    let allPossibilities: { option: IFieldOption; field: IField }[][] = [];

    variationFields.forEach((variationField) => {
      const getPossibilitiesFromField = (
        field: IField,
        allPossibilities: { option: IFieldOption; field: IField }[][]
      ) => {
        let newAllPossibilities = allPossibilities.map((possibility) =>
          possibility.map((el) => ({ ...el }))
        );

        if (newAllPossibilities.length === 0) {
          newAllPossibilities =
            field.options?.map((option) => [{ option, field }]) || [];
        } else {
          allPossibilities.forEach((possibility, i) => {
            field.options?.forEach((option, optionIndex) => {
              if (optionIndex === 0) {
                newAllPossibilities[i].push({ field, option });
              } else {
                newAllPossibilities.push([...possibility, { field, option }]);
              }
            });
          });
        }

        return newAllPossibilities;
      };

      allPossibilities = getPossibilitiesFromField(
        variationField,
        allPossibilities
      );
    });

    const createPromises: Promise<IEntity>[] = allPossibilities.map(
      (possibility) => {
        const clonedEntity: IEntity = _.cloneDeep(entity);
        //@ts-ignore
        delete clonedEntity._id;

        // Remove all entity field values that are associated to the variation fields
        clonedEntity.entityFieldValues = clonedEntity.entityFieldValues.filter(
          (efv) =>
            !possibility.find(
              (p) => p.field._id.toString() === getElementId(efv.field)
            )
        );
        possibility.forEach((optionConfig) => {
          clonedEntity.entityFieldValues.push({
            field: optionConfig.field._id,
            files: [],
            value: [{ language: "en", text: optionConfig.option.value }],
          });
        });

        clonedEntity.parentEntity = entityId;
        return new Promise(async (resolve) => {
          const entity: IEntity = await entityRepository.bulkCreate(
            clonedEntity
          );

          resolve(entity);
        });
      }
    );

    const entities = await Promise.all(createPromises);

    return entities;
  },
  getEntityChildren: async (entityId: string) => {
    const children = await entityRepository.getEntityChildren(entityId);

    return children;
  },
});

export default createEntityService;
