import { fieldService } from "../../../ioc";
import createExpressController from "../../../utils/createExpressController";
import createFieldController from "../ports/field.controller";

const fieldExpressController = createFieldController(fieldService);

export default createExpressController(fieldExpressController);
