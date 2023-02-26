import express, { Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import PaginationCommand from "../../globalTypes/PaginationCommand";
import ResponseDto from "../../globalTypes/ResponseDto";
import protectMiddleware from "../../middleware/protectMiddleware";
import { FileReadDto, toReadDto } from "./dto/FileReadDto";
import { IFile } from "./file.model";
import fileService from "./file.service";

const router = express.Router();

router.post(
  "/getUserFiles",
  protectMiddleware,
  async (
    req: ConnectedRequest<any, any, PaginationCommand, any>,
    res: Response<ResponseDto<FileReadDto[]>>
  ) => {
    const files: IFile[] = await fileService.getUserFiles(req.user, req.body);

    res.status(200).json({
      data: files.map((file) => toReadDto(file)),
      success: true,
    });
  }
);

export default router;
