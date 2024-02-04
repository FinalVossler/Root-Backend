import { Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import fileService from "./file.service";
import {
  IFileGetUnownedAndSelectedFilesCommand,
  IFileGetUserAndSelectedFilesCommand,
  IFileReadDto,
} from "roottypes";
import { fileToReadDto } from "./file.toReadDto";

const fileController = {
  getUserAndSelectedFiles: async (
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
  },
  getUnOwnedAndSelectedFiles: async (
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
  },
};

export default fileController;
