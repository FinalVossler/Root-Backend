import Stripe from "stripe";

import IMakePaymentCommand from "../ports/interfaces/IMakePaymentCommand";
import IPaymentService from "../ports/interfaces/IPaymentService";

const stripe = new Stripe(
  "sk_test_51OyfpxHlNjF4yi4gp0qrLssqRN6hqI45VvM7Sol7QUK10hfsflBS7YXimZNrWDL5235BS7KxmZYR141IRS8Rjspx00a7VWjTRo"
);

const stripePaymentService: IPaymentService = {
  makePayment: async (command: IMakePaymentCommand) => {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: command.currency,
            unit_amount: command.total,
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
