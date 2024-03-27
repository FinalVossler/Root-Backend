interface IMakePaymentCommand {
  total: number;
  successUrl: string;
  cancelUrl: string;
  paymentMethod: string;
  currency: string;
  productName: string;
}

export default IMakePaymentCommand;
