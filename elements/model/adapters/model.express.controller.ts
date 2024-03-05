import createExpressController from "../../../utils/createExpressController";
import roleMongooseRepository from "../../role/adapters/role.mongoose.repository";
import createRoleService from "../../role/ports/role.service";
import createModelController from "../ports/model.controller";
import createModelService from "../ports/model.service";
import modelMongooseRepository from "./model.mongoose.repository";

const modelExpressController = createModelController(
  createModelService(
    createRoleService(roleMongooseRepository),
    modelMongooseRepository
  )
);

export default createExpressController(modelExpressController);
