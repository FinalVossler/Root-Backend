import { Router } from "express";

import protectMiddleware from "../../../../middleware/protectMiddleware";
import orderExpressController from "./order.express.controller";

const orderRouter = Router();

orderRouter.post("/", protectMiddleware, orderExpressController.createOrder);
orderRouter.put(
  "/updateOrderStatus",
  protectMiddleware,
  orderExpressController.updateOrderStatus
);
orderRouter.post(
  "/checkout",
  protectMiddleware,
  orderExpressController.checkout
);

orderRouter.get(
  "/isPaymentSuccessful/:orderId",
  protectMiddleware,
  orderExpressController.isPaymentSuccessful
);

export default orderRouter;
