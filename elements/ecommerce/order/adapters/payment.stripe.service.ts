import Stripe from "stripe";

import IMakePaymentCommand from "../ports/interfaces/IMakePaymentCommand";
import IPaymentService from "../ports/interfaces/IPaymentService";

const stripe = new Stripe(
  "sk_test_51OyfpxHlNjF4yi4gp0qrLssqRN6hqI45VvM7Sol7QUK10hfsflBS7YXimZNrWDL5235BS7KxmZYR141IRS8Rjspx00a7VWjTRo"
);

const stripePaymentService: IPaymentService = {
  checkPaymentMethodValidity: async (paymentMethod: string) => {
    return [
      "acss_debit",
      "affirm",
      "afterpay_clearpay",
      "alipay",
      "au_becs_debit",
      "bacs_debit",
      "bancontact",
      "blik",
      "boleto",
      "card",
      "cashapp",
      "customer_balance",
      "eps",
      "fpx",
      "giropay",
      "grabpay",
      "ideal",
      "klarna",
      "konbini",
      "link",
      "oxxo",
      "p24",
      "paynow",
      "paypal",
      "pix",
      "promptpay",
      "revolut_pay",
      "sepa_debit",
      "sofort",
      "swish",
      "us_bank_account",
      "wechat_pay",
      "zip",
    ].some((el) => el === paymentMethod);
  },
  makePayment: async function (command: IMakePaymentCommand) {
    if (
      !(await (this as IPaymentService).checkPaymentMethodValidity(
        command.paymentMethod
      ))
    ) {
      throw new Error("invalid payment method");
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: [
        command.paymentMethod as Stripe.Checkout.SessionCreateParams.PaymentMethodType,
      ],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: command.currency,
            unit_amount: command.total,
            product_data: {
              name: command.productName,
            },
          },
        },
      ],
      mode: "payment",
      success_url: command.successUrl,
      cancel_url: command.cancelUrl,
      automatic_tax: { enabled: true },
    });

    if (session.url) {
      return {
        checkoutSessionId: session.id,
        checkoutSessionUrl: session.url,
      };
    }

    throw new Error("Error generating payment url");
  },
};

export default stripePaymentService;
