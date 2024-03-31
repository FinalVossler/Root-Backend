import { Router } from "express";

import protectMiddleware from "../../../../middleware/protectMiddleware";
import orderExpressController from "./order.express.controller";

const orderRouter = Router();

orderRouter.post(
  "/getUserOrders",
  protectMiddleware,
  orderExpressController.getUserOrders
);

orderRouter.post(
  "/getUserSales",
  protectMiddleware,
  orderExpressController.getUserSales
);

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

orderRouter.get(
  "/getOrderAssociatedEntities/:orderId",
  protectMiddleware,
  orderExpressController.getOrderAssociatedEntities
);

export default orderRouter;
