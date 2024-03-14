import { Router } from "express";

import protectMiddleware from "../../../../middleware/protectMiddleware";
import cartExpressController from "./cart.express.controller";

const cartRouter = Router();

cartRouter.get("", protectMiddleware, cartExpressController.getUserCart);
cartRouter.put("", protectMiddleware, cartExpressController.updateCart);

export default cartRouter;
