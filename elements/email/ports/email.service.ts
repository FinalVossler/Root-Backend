import { IEmailSendCommand } from "roottypes";

import websiteConfigurationMongooseRepository from "../../websiteConfiguration/adapters/websiteConfiguration.mongoose.repository";
import IUser from "../../user/ports/interfaces/IUser";
import IEmailService from "./interfaces/IEmailService";
import {
  ICreateSendEmailService,
  IMailOptions,
  ISendEmailService,
} from "./interfaces/ISendEmailService";
import IWebsiteConfiguration from "../../websiteConfiguration/ports/interfaces/IWebsiteConfiguration";

const createEmailService = (
  createSendEmailService: ICreateSendEmailService
): IEmailService => ({
  sendContactEmail: async function (command: IEmailSendCommand): Promise<void> {
    const conf: IWebsiteConfiguration =
      await websiteConfigurationMongooseRepository.get();

    const content: string =
      command.firstName +
      " " +
      command.lastName +
      (command.phone ? ", Phone: " + command.phone : "") +
      ", Email: " +
      command.email +
      "\nMessage: " +
      command.message;

    await this.sendEmail({
      to: conf.email || "",
      subject: "Email sent from website: " + conf.title,
      text: content,
    });
  },
  sendChangePasswordEmail: async function (user: IUser, token: string) {
    const conf: IWebsiteConfiguration =
      await websiteConfigurationMongooseRepository.get();

    const content: string =
      "Click the following link to change your password " +
      process.env.ORIGIN +
      "/changePassword/" +
      token.replace(/\./g, "---");

    await this.sendEmail({
      to: user.email,
      subject: conf.title + ": Changing password",
      text: content,
    });
  },
  sendEmail: async function ({
    to,
    subject,
    text,
  }: {
    to: string;
    subject: string;
    text: string;
  }) {
    const conf: IWebsiteConfiguration =
      await websiteConfigurationMongooseRepository.get();

    await this.sendWithNodeMailerAndGoogleOAuth({
      from: process.env.NODEMAILER_EMAIL || "",
      subject,
      text,
      to,
    });
  },
  sendWithNodeMailerAndGoogleOAuth: async function ({
    from,
    to,
    subject,
    text,
  }: {
    from: string;
    to: string;
    subject: string;
    text: string;
  }): Promise<void> {
    let mailOptions: IMailOptions = {
      from,
      to,
      subject,
      html: text,
    };

    const sendEmailService: ISendEmailService = await createSendEmailService();

    const promise = new Promise((resolve, reject) => {
      sendEmailService.sendEmail(mailOptions, (error, info) => {
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
});

export default createEmailService;
