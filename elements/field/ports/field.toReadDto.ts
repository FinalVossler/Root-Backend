import mongoose from "mongoose";
import {
  IFieldOptionReadDto,
  IFieldReadDto,
  IFieldTableElementReadDto,
} from "roottypes";
import { eventToReadDto } from "../../event/ports/event.toReadDto";
import { IFieldTableElement } from "../../fieldTableElement/fieldTableElement.model";
import { IField, IFieldOption } from "./interfaces/IField";

export const fieldToReadDto = (
  field: IField | string
): IFieldReadDto | string => {
  if (typeof field === "string" || !field["_id"]) {
    return field.toString();
  }

  return {
    _id: field._id.toString(),
    name: field.name,
    type: field.type,
    canChooseFromExistingFiles: field.canChooseFromExistingFiles,
    options: field.options,
    fieldEvents: field.fieldEvents.map((e) => eventToReadDto(e)),
    tableOptions: {
      columns:
        field.tableOptions?.columns.map((c) => fieldTableElementToReadDto(c)) ||
        [],
      rows:
        field.tableOptions?.rows.map((r) => fieldTableElementToReadDto(r)) ||
        [],
      yearTable: Boolean(field.tableOptions?.yearTable),
      name: field.tableOptions?.name,
    },
    createdAt: field.createdAt,
    updatedAt: field.updatedAt,
  };
};

export const fieldOptionToReadDtop = (
  fieldOption: IFieldOption
): IFieldOptionReadDto => {
  return {
    label: fieldOption.label,
    value: fieldOption.value,
  };
};

export const fieldTableElementToReadDto = (
  fieldTableElement: IFieldTableElement | string
): IFieldTableElementReadDto | string => {
  if (
    typeof fieldTableElement === "string" ||
    mongoose.Types.ObjectId.isValid(fieldTableElement.toString())
  ) {
    return fieldTableElement.toString();
  }

  return {
    _id: fieldTableElement._id.toString(),
    name: fieldTableElement.name,
  };
};
