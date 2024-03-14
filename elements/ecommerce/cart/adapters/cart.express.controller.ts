import { cartService } from "../../../../ioc";
import createExpressController from "../../../../utils/createExpressController";
import createCartController from "../ports/cart.controller";

const cartExpressController = createCartController(cartService);

export default createExpressController(cartExpressController);
