interface IMakePaymentCommand {
  total: number;
  successUrl: string;
  cancelUrl: string;
  paymentMethod: string;
  currency: string;
}

export default IMakePaymentCommand;
