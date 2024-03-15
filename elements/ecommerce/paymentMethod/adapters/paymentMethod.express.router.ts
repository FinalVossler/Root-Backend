import { Router } from "express";

import protectMiddleware from "../../../../middleware/protectMiddleware";
import paymentMethodExpressController from "./paymentMethod.express.controller";

const paymentMethodRouter = Router();

paymentMethodRouter.post(
  "/",
  protectMiddleware,
  paymentMethodExpressController.createPaymentMethod
);
paymentMethodRouter.put(
  "/",
  protectMiddleware,
  paymentMethodExpressController.updatePaymentMethod
);
paymentMethodRouter.get(
  "/",
  protectMiddleware,
  paymentMethodExpressController.getPaymentMethods
);
paymentMethodRouter.delete(
  "/",
  protectMiddleware,
  paymentMethodExpressController.deletePaymentMethods
);

export default paymentMethodRouter;
