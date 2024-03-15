export interface IMakePaymentCommand {
  total: number;
  successUrl: string;
  cancelUrl: string;
  paymentMethod: string;
}

export default interface IPaymentService {
  makePayment: (command: IMakePaymentCommand) => Promise<string>;
}
