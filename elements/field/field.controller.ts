import { Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import { IField } from "./field.model";
import PaginationResponse from "../../globalTypes/PaginationResponse";
import fieldService from "./field.service";
import roleService from "../role/role.service";
import {
  IFieldCreateCommand,
  IFieldReadDto,
  IFieldUpdateCommand,
  IFieldsGetCommand,
  IFieldsSearchCommand,
  PermissionEnum,
} from "roottypes";
import { fieldToReadDto } from "./field.toReadDto";

const fieldController = {
  createField: async (
    req: ConnectedRequest<any, any, IFieldCreateCommand, any>,
    res: Response<ResponseDto<IFieldReadDto>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: PermissionEnum.CreateField,
    });

    const command: IFieldCreateCommand = req.body;
    const field: IField = await fieldService.createField(command);

    return res.status(200).send({
      success: true,
      data: fieldToReadDto(field) as IFieldReadDto,
    });
  },
  updateField: async (
    req: ConnectedRequest<any, any, IFieldUpdateCommand, any>,
    res: Response<ResponseDto<IFieldReadDto>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: PermissionEnum.UpdateField,
    });

    const command: IFieldUpdateCommand = req.body;

    const field: IField = await fieldService.updateField(command);

    return res.status(200).send({
      success: true,
      data: fieldToReadDto(field) as IFieldReadDto,
    });
  },
  getFields: async (
    req: ConnectedRequest<any, any, IFieldsGetCommand, any>,
    res: Response<ResponseDto<PaginationResponse<IFieldReadDto>>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: PermissionEnum.ReadField,
    });

    const command: IFieldsGetCommand = req.body;
    const { fields, total } = await fieldService.getFields(command);

    return res.status(200).send({
      success: true,
      data: {
        data: fields.map((p) => fieldToReadDto(p) as IFieldReadDto),
        total,
      },
    });
  },
  deleteFields: async (
    req: ConnectedRequest<any, any, string[], any>,
    res: Response<ResponseDto<void>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: PermissionEnum.DeleteField,
    });

    const fieldsIds: string[] = req.body;

    await fieldService.deleteFields(fieldsIds);

    return res.status(200).send({
      success: true,
      data: null,
    });
  },
  searchFields: async (
    req: ConnectedRequest<any, any, IFieldsSearchCommand, any>,
    res: Response<ResponseDto<PaginationResponse<IFieldReadDto>>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: PermissionEnum.ReadField,
    });

    const command: IFieldsSearchCommand = req.body;

    const { fields, total } = await fieldService.search(command);

    return res.status(200).send({
      success: true,
      data: {
        data: fields.map((p) => fieldToReadDto(p) as IFieldReadDto),
        total,
      },
    });
  },
  copyFields: async (
    req: ConnectedRequest<any, any, { ids: string[] }, any>,
    res: Response<ResponseDto<IFieldReadDto[]>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: PermissionEnum.CreateField,
    });

    const createdFields: IField[] = await fieldService.copy(req.body.ids);

    return res.status(200).send({
      success: true,
      data: createdFields.map((f) => fieldToReadDto(f) as IFieldReadDto),
    });
  },
};

export default fieldController;
