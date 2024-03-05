import { IEmailSendCommand } from "roottypes";
import IRequest from "../../../../globalTypes/IRequest";
import IResponseDto from "../../../../globalTypes/IResponseDto";

interface IEmailController {
  createEmail: (
    req: IRequest<IEmailSendCommand>
  ) => Promise<IResponseDto<void>>;
}

export default IEmailController;
