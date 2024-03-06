import {
  IFieldCreateCommand,
  IFieldReadDto,
  IFieldUpdateCommand,
  IFieldsGetCommand,
  IFieldsSearchCommand,
} from "roottypes";

import { fieldToReadDto } from "./field.toReadDto";
import { IFieldController } from "./interfaces/IFieldController";
import { IField } from "./interfaces/IField";
import IRequest from "../../../globalTypes/IRequest";
import IFieldService from "./interfaces/IFieldService";
import IUser from "../../user/ports/interfaces/IUser";

function createFieldController(fieldService: IFieldService): IFieldController {
  return {
    createField: async (
      req: IRequest<IFieldCreateCommand>,
      currentUser: IUser
    ) => {
      const field: IField = await fieldService.createField(
        req.body,
        currentUser
      );

      return {
        success: true,
        data: fieldToReadDto(field) as IFieldReadDto,
      };
    },
    updateField: async (
      req: IRequest<IFieldUpdateCommand>,
      currentUser: IUser
    ) => {
      const field: IField = await fieldService.updateField(
        req.body,
        currentUser
      );

      return {
        success: true,
        data: fieldToReadDto(field) as IFieldReadDto,
      };
    },
    getFields: async (req: IRequest<IFieldsGetCommand>, currentUser: IUser) => {
      const { fields, total } = await fieldService.getFields(
        req.body,
        currentUser
      );

      return {
        success: true,
        data: {
          data: fields.map((p) => fieldToReadDto(p) as IFieldReadDto),
          total,
        },
      };
    },
    deleteFields: async (req: IRequest<string[]>, currentUser: IUser) => {
      await fieldService.deleteFields(req.body, currentUser);

      return {
        success: true,
        data: null,
      };
    },
    searchFields: async (
      req: IRequest<IFieldsSearchCommand>,
      currentUser: IUser
    ) => {
      const { fields, total } = await fieldService.search(
        req.body,
        currentUser
      );

      return {
        success: true,
        data: {
          data: fields.map((p) => fieldToReadDto(p) as IFieldReadDto),
          total,
        },
      };
    },
    copyFields: async (
      req: IRequest<{ ids: string[] }>,
      currentUser: IUser
    ) => {
      const createdFields: IField[] = await fieldService.copy(
        req.body.ids,
        currentUser
      );

      return {
        success: true,
        data: createdFields.map((f) => fieldToReadDto(f) as IFieldReadDto),
      };
    },
  };
}

export default createFieldController;
