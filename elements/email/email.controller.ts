import { Response } from "express";
import { IEmailSendCommand } from "roottypes";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import emailService from "./email.service";

const emailController = {
  createEmail: async (
    req: ConnectedRequest<any, any, IEmailSendCommand, any>,
    res: Response<ResponseDto<void>>
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
