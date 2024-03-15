import { shippingMethodService } from "../../../../ioc";
import createExpressController from "../../../../utils/createExpressController";
import createShippingMethodController from "../ports/shippingMethod.controller";

const shippingMethodController = createShippingMethodController(
  shippingMethodService
);

export default createExpressController(shippingMethodController);
