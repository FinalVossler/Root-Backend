import sgMail from "@sendgrid/mail";

import { IWebsiteConfiguration } from "../websiteConfiguration/websiteConfiguration.model";
import websiteConfigurationRepository from "../websiteConfiguration/websiteConfiguration.repository";
import EmailSendCommand from "./dto/EmailSendCommand";

// TODO: Not used yet
export const sendSendgridEmail = async (command: EmailSendCommand) => {
  const conf: IWebsiteConfiguration =
    await websiteConfigurationRepository.get();

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const content: string =
    command.firstName +
    " " +
    command.lastName +
    (command.phone ? ", Phone: " + command.phone : "") +
    ", Email: " +
    command.email +
    "\nMessage: " +
    command.message;

  const email = {
    to: conf.email, // Change to your recipient
    from: process.env.SENDGRID_SENDER, // Change to your verified sender
    subject: "Email form " + conf.title,
    text: content,
    html: content,
  };

  console.log("message", email);

  try {
    const response = await sgMail.send(email);
    return response;
  } catch (e) {
    console.log("e", e);
    throw e;
  }
};
