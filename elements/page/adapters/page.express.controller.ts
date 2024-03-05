import createExpressController from "../../../utils/createExpressController";
import roleMongooseRepository from "../../role/adapters/role.mongoose.repository";
import createRoleService from "../../role/ports/role.service";
import createPageController from "../ports/page.controller";
import createPageService from "../ports/page.service";
import pageMongooseRepository from "./page.mongoose.repository";

const pageExpressController = createPageController(
  createPageService(
    pageMongooseRepository,
    createRoleService(roleMongooseRepository)
  )
);

export default createExpressController(pageExpressController);
