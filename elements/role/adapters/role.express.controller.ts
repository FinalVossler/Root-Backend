import { roleService } from "../../../ioc";
import createExpressController from "../../../utils/createExpressController";
import createRoleController from "../ports/role.controller";

const roleExressController = createRoleController(roleService);

export default createExpressController(roleExressController);
