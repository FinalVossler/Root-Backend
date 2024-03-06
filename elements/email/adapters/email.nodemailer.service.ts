import nodemailer from "nodemailer";
import { google } from "googleapis";

import {
  ICreateSendEmailService,
  IMailOptions,
  ISendMailCallback,
} from "../ports/interfaces/ISendEmailService";

const createNodeMailerSendEmailService: ICreateSendEmailService = async () => {
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

  return {
    sendEmail: async (
      mailOptions: IMailOptions,
      callback: ISendMailCallback
    ) => {
      const promise = new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, callback);
      });

      await promise;
    },
  };
};

export default createNodeMailerSendEmailService;
