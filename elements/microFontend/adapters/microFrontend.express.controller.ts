import { microFrontendService } from "../../../ioc";

import createExpressController from "../../../utils/createExpressController";
import createMicroFrontendController from "../ports/microFrontend.controller";

const microFrontendExpressController =
  createMicroFrontendController(microFrontendService);

export default createExpressController(microFrontendExpressController);
