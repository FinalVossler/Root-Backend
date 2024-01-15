import express, { Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import protectMiddleware from "../../middleware/protectMiddleware";
import { IUser } from "../user/user.model";
import cypressService from "./cypress.service";
import { IFile } from "../file/file.model";
import { IFileReadDto } from "roottypes";
import { fileToReadDto } from "../file/file.toReadDto";

const router = express.Router();

router.post(
  "/clean",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, any, any>,
    res: Response<ResponseDto<void>>
  ) => {
    const currentUser: IUser = req.user;

    await cypressService.clean(currentUser);

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
    res: Response<ResponseDto<IFileReadDto>>
  ) => {
    const currentUser = req.user;

    const file: IFile = await cypressService.createFile(
      req.body.url,
      currentUser
    );

    res.status(200).json({
      data: fileToReadDto(file) as IFileReadDto,
      success: true,
    });
  }
);

router.post(
  "/prepareMarketMaven",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, any, any>,
    res: Response<ResponseDto<void>>
  ) => {
    const currentUser = req.user;

    await cypressService.prepareMarketMaven();

    res.status(200).json({
      data: null,
      success: true,
    });
  }
);

export default router;
