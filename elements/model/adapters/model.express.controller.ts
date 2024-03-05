import { modelService } from "../../../ioc";
import createExpressController from "../../../utils/createExpressController";
import createModelController from "../ports/model.controller";

const modelExpressController = createModelController(modelService);

export default createExpressController(modelExpressController);
