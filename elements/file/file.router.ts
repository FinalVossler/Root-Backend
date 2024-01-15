import express, { Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import protectMiddleware from "../../middleware/protectMiddleware";
import fileService from "./file.service";
import {
  IFileGetUnownedAndSelectedFilesCommand,
  IFileGetUserAndSelectedFilesCommand,
  IFileReadDto,
} from "roottypes";
import { fileToReadDto } from "./file.toReadDto";

const router = express.Router();

router.post(
  "/getUserAndSelectedFiles",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, IFileGetUserAndSelectedFilesCommand, any>,
    res: Response<ResponseDto<{ files: IFileReadDto[]; total: number }>>
  ) => {
    const { files, total } = await fileService.getUserFiles(req.user, req.body);

    res.status(200).json({
      data: {
        files: files.map((file) => fileToReadDto(file) as IFileReadDto),
        total,
      },
      success: true,
    });
  }
);

router.post(
  "/getUnOwnedAndSelectedFiles",
  protectMiddleware,
  async (
    req: ConnectedRequest<
      any,
      any,
      IFileGetUnownedAndSelectedFilesCommand,
      any
    >,
    res: Response<ResponseDto<{ files: IFileReadDto[]; total: number }>>
  ) => {
    const { files, total } = await fileService.getUnownedFiles(req.body);

    res.status(200).json({
      data: {
        files: files.map((file) => fileToReadDto(file) as IFileReadDto),
        total,
      },
      success: true,
    });
  }
);

export default router;
