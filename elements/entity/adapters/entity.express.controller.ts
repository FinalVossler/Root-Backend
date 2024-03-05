import createExpressController from "../../../utils/createExpressController";
import modelMongooseRepository from "../../model/adapters/model.mongoose.repository";
import createModelService from "../../model/ports/model.service";
import roleMongooseRepository from "../../role/adapters/role.mongoose.repository";
import createRoleService from "../../role/ports/role.service";
import userMongooseRepository from "../../user/adapters/user.mongoose.repository";
import createUserService from "../../user/ports/user.service";
import createEntityController from "../ports/entity.controller";
import createEntityService from "../ports/entity.service";
import entityMongooseRepository from "./entity.mongoose.repository";

const roleService = createRoleService(roleMongooseRepository);
const modelService = createModelService(roleService, modelMongooseRepository);
const userService = createUserService(roleService, userMongooseRepository);
const entityExpressController = createEntityController(
  createEntityService(
    createRoleService(roleMongooseRepository),
    entityMongooseRepository,
    modelService,
    userService
  )
);

export default createExpressController(entityExpressController);
