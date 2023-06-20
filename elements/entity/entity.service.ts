import mongoose from "mongoose";

import { IEntity } from "./entity.model";
import EntitiesGetCommand from "./dto/EntitiesGetCommand";
import entityRepository from "./entity.repository";
import EntityCreateCommand, {
  EntityFieldValueCommand,
} from "./dto/EntityCreateCommand";
import EntityUpdateCommand from "./dto/EntityUpdateCommand";
import { IUser } from "../user/user.model";
import EntitiesSearchCommand from "./dto/EntitiesSearchCommand";
import entityEventNotificationService from "../entityEventNotification/entityEventNotification.service";
import { EntityEventNotificationTrigger } from "../entityEventNotification/entityEventNotification.model";
import { IModel, IModelField } from "../model/model.model";
import modelSerivce from "../model/model.service";
import { FieldType } from "../field/field.model";

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
  createEntity: async (
    command: EntityCreateCommand,
    currentUser: IUser
  ): Promise<IEntity> => {
    const entity: IEntity = await entityRepository.create(command);

    // Required fields validation
    const { valid, errorText } = await entityService.verifyRequiredFields({
      entityFieldValueCommands: command.entityFieldValues,
      modelId: command.modelId.toString(),
    });

    if (!valid) {
      throw new Error(errorText);
    }

    await entityEventNotificationService.notifyUsers(
      command.modelId.toString(),
      EntityEventNotificationTrigger.OnCreate,
      entity,
      currentUser
    );

    return entity;
  },
  updateEntity: async (
    command: EntityUpdateCommand,
    currentUser: IUser
  ): Promise<IEntity> => {
    const entity: IEntity = await entityRepository.update(command, currentUser);

    // Required fields validation
    const { valid, errorText } = await entityService.verifyRequiredFields({
      entityFieldValueCommands: command.entityFieldValues,
      modelId: command.modelId.toString(),
    });

    if (!valid) {
      throw new Error(errorText);
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
