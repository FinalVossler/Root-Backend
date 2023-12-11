import express, { Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import protectMiddleware from "../../middleware/protectMiddleware";
import { IUser } from "../user/user.model";
import cypressService from "./cypress.service";
import { IFile } from "../file/file.model";
import { FileReadDto, toReadDto } from "../file/dto/FileReadDto";

const router = express.Router();

router.post(
  "/prepare",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, any, any>,
    res: Response<ResponseDto<void>>
  ) => {
    const currentUser: IUser = req.user;

    await cypressService.prepare(currentUser);

    res.status(200).json({
      data: null,
      success: true,
    });
  }
);

router.post(
  "/createFile",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, { url: string }, any>,
    res: Response<ResponseDto<FileReadDto>>
  ) => {
    const currentUser = req.user;

    const file: IFile = await cypressService.createFile(
      req.body.url,
      currentUser
    );

    res.status(200).json({
      data: toReadDto(file),
      success: true,
    });
  }
);

export default router;
