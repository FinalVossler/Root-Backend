import { IEntityReadDto, IEntityFieldValueReadDto } from "roottypes";

import { modelToReadDto } from "../../model/ports/model.toReadDto";
import { userToReadDto } from "../../user/ports/user.toReadDto";
import {
  fieldTableElementToReadDto,
  fieldToReadDto,
} from "../../field/ports/field.toReadDto";
import { fileToReadDto } from "../../file/ports/file.toReadDto";
import IEntity, { IEntityFieldValue } from "./interfaces/IEntity";

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
    owner: entity.owner ? userToReadDto(entity.owner) : entity.owner,
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
    yearTableValues: entityFieldValue.yearTableValues?.map(
      (yearTableValue) => ({
        row: fieldTableElementToReadDto(yearTableValue.row),
        values: yearTableValue.values,
      })
    ),
  };
};
