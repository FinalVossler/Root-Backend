import nodemailer from "nodemailer";
import { IWebsiteConfiguration } from "../websiteConfiguration/websiteConfiguration.model";

import websiteConfigurationRepository from "../websiteConfiguration/websiteConfiguration.repository";
import EmailSendCommand from "./dto/EmailSendCommand";

const emailService = {
  send: async (command: EmailSendCommand) => {
    const conf: IWebsiteConfiguration =
      await websiteConfigurationRepository.get();

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    let mailOptions = {
      from: command.email,
      to: conf.email,
      subject: "Email sent on " + conf.title,
      text:
        "From " +
        command.firstName +
        " " +
        command.lastName +
        ": " +
        command.message,
    };

    const promise = new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          throw new Error(error.message);
        }
      });
    });

    await promise;
  },
};

export default emailService;
