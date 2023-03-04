import express, { Response } from "express";

import ConnectedRequest from "../../globalTypes/ConnectedRequest";
import ResponseDto from "../../globalTypes/ResponseDto";
import EmailSendCommand from "./dto/EmailSendCommand";
import emailService from "./email.service";

const router = express.Router();

router.post(
  "/",
  async (
    req: ConnectedRequest<any, any, EmailSendCommand, any>,
    res: Response<ResponseDto<void>>
  ) => {
    const command: EmailSendCommand = req.body;

    await emailService.send(command);

    res.status(200).json({
      success: true,
      data: null,
    });
  }
);

export default router;
