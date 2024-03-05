import { Response } from "express";
import { IEmailSendCommand } from "roottypes";

import IConnectedRequest from "../../globalTypes/IConnectedRequest";
import IResponseDto from "../../globalTypes/IResponseDto";
import emailService from "./email.service";

const emailController = {
  createEmail: async (
    req: IConnectedRequest<any, any, IEmailSendCommand, any>,
    res: Response<IResponseDto<void>>
  ) => {
    const command: IEmailSendCommand = req.body;

    await emailService.sendContactEmail(command);

    res.status(200).json({
      success: true,
      data: null,
    });
  },
};

export default emailController;
