import createExpressController from "../../../utils/createExpressController";
import createRoleService from "../../role/ports/role.service";
import createRoleController from "../ports/role.controller";
import roleMongooseRepository from "./role.mongoose.repository";

const roleExressController = createRoleController(
  createRoleService(roleMongooseRepository)
);

export default createExpressController(roleExressController);
