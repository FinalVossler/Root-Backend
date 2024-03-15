import { paymentMethodService } from "../../../../ioc";
import createExpressController from "../../../../utils/createExpressController";
import createPaymentMethodController from "../ports/paymentMethod.controller";

const paymentMethodController =
  createPaymentMethodController(paymentMethodService);

export default createExpressController(paymentMethodController);
