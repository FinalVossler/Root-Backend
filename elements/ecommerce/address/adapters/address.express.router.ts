import { Router } from "express";

import protectMiddleware from "../../../../middleware/protectMiddleware";
import addressExpressController from "./address.express.controller";

const addressRouter = Router();

addressRouter.post(
  "/",
  protectMiddleware,
  addressExpressController.createAddress
);
addressRouter.put(
  "/",
  protectMiddleware,
  addressExpressController.updateAddress
);
addressRouter.get(
  "/",
  protectMiddleware,
  addressExpressController.getAddresses
);

addressRouter.post(
  "/getUserAddresses",
  protectMiddleware,
  addressExpressController.getUserAddresses
);

addressRouter.delete(
  "/",
  protectMiddleware,
  addressExpressController.deleteAddresses
);

addressRouter.post(
  "/setDefaultAddress",
  protectMiddleware,
  addressExpressController.setDefaultAddress
);

export default addressRouter;
