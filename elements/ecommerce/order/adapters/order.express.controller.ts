import { mockedOrderService, orderService } from "../../../../ioc";
import createExpressController from "../../../../utils/createExpressController";
import createOrderController from "../ports/order.controller";

const orderExpressController = createOrderController(
  process.env.NODE_ENV === "test" ? mockedOrderService : orderService
);

export default createExpressController(orderExpressController);
