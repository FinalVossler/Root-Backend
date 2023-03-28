import express, { Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import protectMiddleware from "../../middleware/protectMiddleware";
import FileGetUnownedAndSelectedFilesCommand from "./dto/FileGetUnownedAndSelectedFilesCommand";
import FileGetUserAndSelectedFilesCommand from "./dto/FileGetUserAndSelectedFilesCommand";
import { FileReadDto, toReadDto } from "./dto/FileReadDto";
import fileService from "./file.service";

const router = express.Router();

router.post(
  "/getUserAndSelectedFiles",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, FileGetUserAndSelectedFilesCommand, any>,
    res: Response<ResponseDto<{ files: FileReadDto[]; total: number }>>
  ) => {
    const { files, total } = await fileService.getUserFiles(req.user, req.body);

    res.status(200).json({
      data: {
        files: files.map((file) => toReadDto(file)),
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
    req: ConnectedRequest<any, any, FileGetUnownedAndSelectedFilesCommand, any>,
    res: Response<ResponseDto<{ files: FileReadDto[]; total: number }>>
  ) => {
    const { files, total } = await fileService.getUnownedFiles(req.body);

    res.status(200).json({
      data: {
        files: files.map((file) => toReadDto(file)),
        total,
      },
      success: true,
    });
  }
);

export default router;
