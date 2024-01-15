import { IEntityReadDto, IEntityFieldValueReadDto } from "roottypes";
import { IEntity, IEntityFieldValue } from "./entity.model";
import { modelToReadDto } from "../model/modelToReadDto";
import { userToReadDto } from "../user/user.toReadDto";
import {
  fieldTableElementToReadDto,
  fieldToReadDto,
} from "../field/field.toReadDto";
import { fileToReadDto } from "../file/file.toReadDto";

export const entityToReadDto = (entity: IEntity): IEntityReadDto => {
  return {
    _id: entity._id.toString(),
    assignedUsers: entity.assignedUsers
      ? entity.assignedUsers?.map((u) => userToReadDto(u))
      : [],
    entityFieldValues: entity.entityFieldValues.map((f) =>
      entityFieldValueToReadDto(f)
    ),
    model: modelToReadDto(entity.model),
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    customData: entity.customData,
  };
};

export const entityFieldValueToReadDto = (
  entityFieldValue: IEntityFieldValue
): IEntityFieldValueReadDto => {
  return {
    field: fieldToReadDto(entityFieldValue.field),
    files: entityFieldValue.files.map((f) => fileToReadDto(f)),
    value: entityFieldValue.value,
    tableValues: entityFieldValue.tableValues?.map((tableValue) => ({
      column: fieldTableElementToReadDto(tableValue.column),
      row: fieldTableElementToReadDto(tableValue.row),
      value: tableValue.value,
    })),
  };
};
