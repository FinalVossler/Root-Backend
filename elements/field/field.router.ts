import { Router, Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import { IField } from "./field.model";
import PaginationResponse from "../../globalTypes/PaginationResponse";
import { Role } from "../user/user.model";
import adminProtectMiddleware from "../../middleware/adminProtectMiddleware";
import FieldCreateCommand from "./dto/FieldCreateCommand";
import fieldService from "./field.service";
import FieldReadDto, { toReadDto } from "./dto/FieldReadDto";
import FieldsGetCommand from "./dto/FieldsGetCommand";
import FieldUpdateCommand from "./dto/FieldUpdateCommand";
import protectMiddleware from "../../middleware/protectMiddleware";
import mongoose from "mongoose";

const router = Router();

router.post(
  "/",
  protectMiddleware,
  adminProtectMiddleware,
  async (
    req: ConnectedRequest<any, any, FieldCreateCommand, any>,
    res: Response<ResponseDto<FieldReadDto>>
  ) => {
    const command: FieldCreateCommand = req.body;
    if (req.user.role !== Role.Admin) {
      throw new Error("Unauthorized to create field");
    }
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
  adminProtectMiddleware,
  async (
    req: ConnectedRequest<any, any, FieldUpdateCommand, any>,
    res: Response<ResponseDto<FieldReadDto>>
  ) => {
    const command: FieldUpdateCommand = req.body;
    if (req.user.role !== Role.Admin) {
      throw new Error("Unauthorized to update field");
    }
    const field: IField = await fieldService.updateField(command);

    return res.status(200).send({
      success: true,
      data: toReadDto(field),
    });
  }
);

router.post(
  "/getFields",
  async (
    req: ConnectedRequest<any, any, FieldsGetCommand, any>,
    res: Response<ResponseDto<PaginationResponse<FieldReadDto>>>
  ) => {
    const command: FieldsGetCommand = req.body;
    const { fields, total } = await fieldService.getFields(command);

    console.log("fields", fields);
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
  adminProtectMiddleware,
  async (
    req: ConnectedRequest<any, any, mongoose.ObjectId[], any>,
    res: Response<ResponseDto<void>>
  ) => {
    const fieldsIds: mongoose.ObjectId[] = req.body;
    await fieldService.deleteFields(fieldsIds);

    return res.status(200).send({
      success: true,
      data: null,
    });
  }
);

export default router;