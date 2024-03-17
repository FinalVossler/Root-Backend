import { IFileReadDto } from "roottypes";

import { fileToReadDto } from "../../file/ports/file.toReadDto";
import IUser from "../../user/ports/interfaces/IUser";
import IFile from "../../file/ports/interfaces/IFile";
import ITestsPreparationController from "./interfaces/ITestsPreparationController";
import IRequest from "../../../globalTypes/IRequest";
import ITestsPreparationService from "./interfaces/ITestsPreparationService";

const createTestsPreparationController = (
  testsPreparationService: ITestsPreparationService
): ITestsPreparationController => ({
  clean: async (req: IRequest, currentUser: IUser) => {
    await testsPreparationService.clean(currentUser);

    return {
      data: null,
      success: true,
    };
  },
  createFile: async (req: IRequest<{ url: string }>, currentUser: IUser) => {
    const file: IFile = await testsPreparationService.createFile(
      req.body.url,
      currentUser
    );

    return {
      data: fileToReadDto(file) as IFileReadDto,
      success: true,
    };
  },
  prepareMarketMaven: async (req: IRequest, currentUser: IUser) => {
    await testsPreparationService.prepareMarketMaven(currentUser);

    return {
      data: null,
      success: true,
    };
  },
  prepareEcommerce: async (req: IRequest, currentUser: IUser) => {
    await testsPreparationService.perpareEcommerce(currentUser);

    return {
      data: null,
      success: true,
    };
  },
});

export default createTestsPreparationController;
