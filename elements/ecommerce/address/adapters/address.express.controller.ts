import { addressService } from "../../../../ioc";
import createExpressController from "../../../../utils/createExpressController";
import createAddressController from "../ports/address.controller";

const addressController = createAddressController(addressService);

export default createExpressController(addressController);
