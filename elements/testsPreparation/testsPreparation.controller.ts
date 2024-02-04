import { Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import { IUser } from "../user/user.model";
import testsPreparationService from "./testsPreparation.service";
import { IFile } from "../file/file.model";
import { IFileReadDto } from "roottypes";
import { fileToReadDto } from "../file/file.toReadDto";

const testsPreparationController = {
  clean: async (
    req: ConnectedRequest<any, any, any, any>,
    res: Response<ResponseDto<void>>
  ) => {
    const currentUser: IUser = req.user;

    await testsPreparationService.clean(currentUser);

    res.status(200).json({
      data: null,
      success: true,
    });
  },
  createFile: async (
    req: ConnectedRequest<any, any, { url: string }, any>,
    res: Response<ResponseDto<IFileReadDto>>
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
    req: ConnectedRequest<any, any, any, any>,
    res: Response<ResponseDto<void>>
  ) => {
    await testsPreparationService.prepareMarketMaven();

    res.status(200).json({
      data: null,
      success: true,
    });
  },
};

export default testsPreparationController;
