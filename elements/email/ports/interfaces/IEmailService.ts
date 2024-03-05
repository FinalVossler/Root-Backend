import { IEmailSendCommand } from "roottypes";
import IUser from "../../../user/ports/interfaces/IUser";

interface IEmailService {
  sendContactEmail: (command: IEmailSendCommand) => Promise<void>;
  sendChangePasswordEmail: (user: IUser, token: string) => Promise<void>;
  sendEmail: ({
    to,
    subject,
    text,
  }: {
    to: string;
    subject: string;
    text: string;
  }) => Promise<void>;
  sendWithNodeMailerAndGoogleOAuth: ({
    from,
    to,
    subject,
    text,
  }: {
    from: string;
    to: string;
    subject: string;
    text: string;
  }) => Promise<void>;
}

export default IEmailService;
