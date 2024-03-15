import { orderService } from "../../../../ioc";
import createExpressController from "../../../../utils/createExpressController";
import createOrderController from "../ports/order.controller";

const orderExpressController = createOrderController(orderService);

export default createExpressController(orderExpressController);
