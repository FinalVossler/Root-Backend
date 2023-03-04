import nodemailer from "nodemailer";
import { IWebsiteConfiguration } from "../websiteConfiguration/websiteConfiguration.model";

import websiteConfigurationRepository from "../websiteConfiguration/websiteConfiguration.repository";
import EmailSendCommand from "./dto/EmailSendCommand";

const emailService = {
  send: async (command: EmailSendCommand): Promise<void> => {
    const conf: IWebsiteConfiguration =
      await websiteConfigurationRepository.get();

    const content: string =
      command.firstName +
      " " +
      command.lastName +
      (command.phone ? ", Phone: " + command.phone : "") +
      ", Email: " +
      command.email +
      "\nMessage: " +
      command.message;

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_EMAIL_PASSWORD,
      },
    });

    let mailOptions = {
      from: command.email,
      to: conf.email,
      subject: "Email sent from wewsite: " + conf.title,
      text: content,
    };

    const promise = new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(error);
          throw new Error(error.message);
        } else {
          resolve(info);
        }
      });
    });

    await promise;
  },
};

export default emailService;
