import nodemailer from "nodemailer";

import { IUser } from "../user/user.model";
import { IWebsiteConfiguration } from "../websiteConfiguration/websiteConfiguration.model";
import websiteConfigurationRepository from "../websiteConfiguration/websiteConfiguration.repository";
import EmailSendCommand from "./dto/EmailSendCommand";
import { google } from "googleapis";

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

    await emailService.sendEmail({
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

    await emailService.sendEmail({
      to: user.email,
      subject: conf.title + ": Changing password",
      text: content,
    });
  },
  sendEmail: async ({
    to,
    subject,
    text,
  }: {
    to: string;
    subject: string;
    text: string;
  }) => {
    const conf: IWebsiteConfiguration =
      await websiteConfigurationRepository.get();

    await emailService.sendWithNodeMailerAndGoogleOAuth({
      from: process.env.NODEMAILER_EMAIL,
      subject,
      text,
      to,
    });
  },
  sendWithNodeMailerAndGoogleOAuth: async ({
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
    const OAuth2 = google.auth.OAuth2;

    const OAuthClient = new OAuth2(
      process.env.GMAIL_OAUTH_CLIENT_ID,
      process.env.GMAIL_OAUTH_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );
    OAuthClient.setCredentials({
      refresh_token: process.env.GMAIL_MAIL_REFRESH_TOKEN,
    });

    const accessToken = await new Promise((resolve, reject) => {
      OAuthClient.getAccessToken((err, token) => {
        if (err) {
          reject("Failed to create access token :(");
        }
        resolve(token);
      });
    });

    let transporter = nodemailer.createTransport({
      //@ts-ignore
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        type: "OAuth2",
        clientId: process.env.GMAIL_OAUTH_CLIENT_ID,
        clientSecret: process.env.GMAIL_OAUTH_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_MAIL_REFRESH_TOKEN,
        accessToken: accessToken,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    let mailOptions = {
      from,
      to,
      subject,
      html: text,
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
