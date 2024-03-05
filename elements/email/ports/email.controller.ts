import { IEmailSendCommand } from "roottypes";

import IEmailController from "./interfaces/IEmailController";
import IRequest from "../../../globalTypes/IRequest";
import IEmailService from "./interfaces/IEmailService";

const createEmailController = (
  emailService: IEmailService
): IEmailController => ({
  createEmail: async (req: IRequest<IEmailSendCommand>) => {
    const command: IEmailSendCommand = req.body;

    await emailService.sendContactEmail(command);

    return {
      success: true,
      data: null,
    };
  },
});

export default createEmailController;
