import createExpressController from "../../../utils/createExpressController";
import roleMongooseRepository from "../../role/adapters/role.mongoose.repository";
import createRoleService from "../../role/ports/role.service";
import createUserController from "../ports/user.controller";
import createUserService from "../ports/user.service";
import userMongooseRepository from "./user.mongoose.repository";

const userExpressController = createUserController(
  createUserService(
    createRoleService(roleMongooseRepository),
    userMongooseRepository
  )
);

export default createExpressController(userExpressController);
