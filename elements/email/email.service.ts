import nodemailer from "nodemailer";
import { IUser } from "../user/user.model";
import { IWebsiteConfiguration } from "../websiteConfiguration/websiteConfiguration.model";

import websiteConfigurationRepository from "../websiteConfiguration/websiteConfiguration.repository";
import EmailSendCommand from "./dto/EmailSendCommand";

const emailService = {
  sendContactEmail: async (command: EmailSendCommand): Promise<void> => {
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

    await emailService.send({
      from: command.email,
      to: conf.email,
      subject: "Email sent from website: " + conf.title,
      text: content,
    });
  },
  sendChangePasswordEmail: async (user: IUser, token: string) => {
    const conf: IWebsiteConfiguration =
      await websiteConfigurationRepository.get();

    const content: string =
      "Click the following link to change your password " +
      process.env.ORIGIN +
      "/changePassword/" +
      token;

    await emailService.send({
      from: conf.email,
      to: user.email,
      subject: conf.title + ": Changing password",
      text: content,
    });
  },
  send: async ({
    from,
    to,
    subject,
    text,
  }: {
    from: string;
    to: string;
    subject: string;
    text: string;
  }): Promise<void> => {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_EMAIL_PASSWORD,
      },
    });

    let mailOptions = {
      from,
      to,
      subject,
      text,
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
