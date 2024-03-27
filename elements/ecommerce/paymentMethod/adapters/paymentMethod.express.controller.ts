import {
  mockedPaymentMethodService,
  paymentMethodService,
} from "../../../../ioc";
import createExpressController from "../../../../utils/createExpressController";
import createPaymentMethodController from "../ports/paymentMethod.controller";

const paymentMethodController = createPaymentMethodController(
  process.env.NODE_ENV === "test"
    ? mockedPaymentMethodService
    : paymentMethodService
);

export default createExpressController(paymentMethodController);
