import { Response } from "express";

import IConnectedRequest from "../../globalTypes/IConnectedRequest";
import IResponseDto from "../../globalTypes/IResponseDto";
import testsPreparationService from "./testsPreparation.service";
import { IFile } from "../file/file.model";
import { IFileReadDto } from "roottypes";
import { fileToReadDto } from "../file/file.toReadDto";
import IUser from "../user/ports/interfaces/IUser";

const testsPreparationController = {
  clean: async (
    req: IConnectedRequest<any, any, any, any>,
    res: Response<IResponseDto<void>>
  ) => {
    const currentUser: IUser = req.user;

    await testsPreparationService.clean(currentUser);

    res.status(200).json({
      data: null,
      success: true,
    });
  },
  createFile: async (
    req: IConnectedRequest<any, any, { url: string }, any>,
    res: Response<IResponseDto<IFileReadDto>>
  ) => {
    const currentUser = req.user;

    const file: IFile = await testsPreparationService.createFile(
      req.body.url,
      currentUser
    );

    res.status(200).json({
      data: fileToReadDto(file) as IFileReadDto,
      success: true,
    });
  },
  prepareMarketMaven: async (
    req: IConnectedRequest<any, any, any, any>,
    res: Response<IResponseDto<void>>
  ) => {
    await testsPreparationService.prepareMarketMaven();

    res.status(200).json({
      data: null,
      success: true,
    });
  },
};

export default testsPreparationController;
