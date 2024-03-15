import { Router } from "express";

import protectMiddleware from "../../../../middleware/protectMiddleware";
import shippingMethodExpressController from "./shippingMethod.express.controller";

const shippingMethodRouter = Router();

shippingMethodRouter.post(
  "/",
  protectMiddleware,
  shippingMethodExpressController.createShippingMethod
);
shippingMethodRouter.put(
  "/",
  protectMiddleware,
  shippingMethodExpressController.updateShippingMethod
);
shippingMethodRouter.get(
  "/",
  protectMiddleware,
  shippingMethodExpressController.getShippingMethods
);
shippingMethodRouter.delete(
  "/",
  protectMiddleware,
  shippingMethodExpressController.deleteShippingMethods
);

export default shippingMethodRouter;
