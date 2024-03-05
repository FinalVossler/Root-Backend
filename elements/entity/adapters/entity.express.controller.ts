import { entityService } from "../../../ioc";
import createExpressController from "../../../utils/createExpressController";
import createEntityController from "../ports/entity.controller";

const entityExpressController = createEntityController(entityService);

export default createExpressController(entityExpressController);
