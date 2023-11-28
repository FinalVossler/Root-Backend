import { Router, Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import { IField } from "./field.model";
import PaginationResponse from "../../globalTypes/PaginationResponse";
import FieldCreateCommand from "./dto/FieldCreateCommand";
import fieldService from "./field.service";
import FieldReadDto, { toReadDto } from "./dto/FieldReadDto";
import FieldsGetCommand from "./dto/FieldsGetCommand";
import FieldUpdateCommand from "./dto/FieldUpdateCommand";
import protectMiddleware from "../../middleware/protectMiddleware";
import mongoose from "mongoose";
import FieldsSearchCommand from "./dto/FieldsSearchCommand";
import roleService from "../role/role.service";
import { Permission } from "../role/role.model";

const router = Router();

router.post(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, FieldCreateCommand, any>,
    res: Response<ResponseDto<FieldReadDto>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: Permission.CreateField,
    });

    const command: FieldCreateCommand = req.body;
    const field: IField = await fieldService.createField(command);

    return res.status(200).send({
      success: true,
      data: toReadDto(field),
    });
  }
);

router.put(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, FieldUpdateCommand, any>,
    res: Response<ResponseDto<FieldReadDto>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: Permission.UpdateField,
    });

    const command: FieldUpdateCommand = req.body;

    const field: IField = await fieldService.updateField(command);

    return res.status(200).send({
      success: true,
      data: toReadDto(field),
    });
  }
);

router.post(
  "/getFields",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, FieldsGetCommand, any>,
    res: Response<ResponseDto<PaginationResponse<FieldReadDto>>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: Permission.ReadField,
    });

    const command: FieldsGetCommand = req.body;
    const { fields, total } = await fieldService.getFields(command);

    return res.status(200).send({
      success: true,
      data: {
        data: fields.map((p) => toReadDto(p)),
        total,
      },
    });
  }
);

router.delete(
  "/",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, mongoose.Types.ObjectId[], any>,
    res: Response<ResponseDto<void>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: Permission.DeleteField,
    });

    const fieldsIds: mongoose.Types.ObjectId[] = req.body;

    await fieldService.deleteFields(fieldsIds);

    return res.status(200).send({
      success: true,
      data: null,
    });
  }
);

router.post(
  "/search",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, FieldsSearchCommand, any>,
    res: Response<ResponseDto<PaginationResponse<FieldReadDto>>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: Permission.ReadField,
    });

    const command: FieldsSearchCommand = req.body;

    const { fields, total } = await fieldService.search(command);

    return res.status(200).send({
      success: true,
      data: {
        data: fields.map((p) => toReadDto(p)),
        total,
      },
    });
  }
);

router.post(
  "/copy",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, { ids: string[] }, any>,
    res: Response<ResponseDto<FieldReadDto[]>>
  ) => {
    roleService.checkPermission({
      user: req.user,
      permission: Permission.CreateField,
    });

    const createdFields: IField[] = await fieldService.copy(req.body.ids);

    return res.status(200).send({
      success: true,
      data: createdFields.map((f) => toReadDto(f)),
    });
  }
);

export default router;
