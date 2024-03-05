import createExpressController from "../../../utils/createExpressController";
import roleMongooseRepository from "../../role/adapters/role.mongoose.repository";
import createRoleService from "../../role/ports/role.service";
import createFieldController from "../ports/field.controller";
import createFieldService from "../ports/field.service";
import mongooseFieldRepository from "./field.mongoose.repository";

const fieldExpressController = createFieldController(
  createFieldService(
    mongooseFieldRepository,
    createRoleService(roleMongooseRepository)
  )
);

export default createExpressController(fieldExpressController);
