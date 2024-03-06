import { IFileReadDto } from "roottypes";

import IRequest from "../../../../globalTypes/IRequest";
import IResponseDto from "../../../../globalTypes/IResponseDto";
import IUser from "../../../user/ports/interfaces/IUser";

type ITestsPreparationController = {
  clean: (req: IRequest, currentUser: IUser) => Promise<IResponseDto<void>>;
  createFile: (
    req: IRequest<{ url: string }>,
    currentUser: IUser
  ) => Promise<IResponseDto<IFileReadDto>>;
  prepareMarketMaven: (req: IRequest) => Promise<IResponseDto<void>>;
};

export default ITestsPreparationController;
