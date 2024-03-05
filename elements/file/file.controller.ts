import { Response } from "express";

import IConnectedRequest from "../../globalTypes/IConnectedRequest";
import IResponseDto from "../../globalTypes/IResponseDto";
import fileService from "./file.service";
import {
  IFileGetUnownedAndSelectedFilesCommand,
  IFileGetUserAndSelectedFilesCommand,
  IFileReadDto,
} from "roottypes";
import { fileToReadDto } from "./file.toReadDto";

const fileController = {
  getUserAndSelectedFiles: async (
    req: IConnectedRequest<any, any, IFileGetUserAndSelectedFilesCommand, any>,
    res: Response<IResponseDto<{ files: IFileReadDto[]; total: number }>>
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
    req: IConnectedRequest<
      any,
      any,
      IFileGetUnownedAndSelectedFilesCommand,
      any
    >,
    res: Response<IResponseDto<{ files: IFileReadDto[]; total: number }>>
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
