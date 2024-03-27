import IMakePaymentCommand from "./IMakePaymentCommand";

export default interface IPaymentService {
  makePayment: (
    command: IMakePaymentCommand
  ) => Promise<{ checkoutSessionId: string; checkoutSessionUrl: string }>;
  checkPaymentMethodValidity: (paymentMethod: string) => Promise<boolean>;
}
