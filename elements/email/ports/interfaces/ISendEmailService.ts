export interface IMailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export type ISendMailCallback = (error: Error, ...args: any[]) => void;

export interface ISendEmailService {
  sendEmail: (
    options: IMailOptions,
    callback: ISendMailCallback
  ) => Promise<void>;
}

export type ICreateSendEmailService = () => Promise<ISendEmailService>;
