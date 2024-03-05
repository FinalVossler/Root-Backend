import { roleService } from "../../../ioc";
import createExpressController from "../../../utils/createExpressController";
import createPageController from "../ports/page.controller";
import createPageService from "../ports/page.service";
import pageMongooseRepository from "./page.mongoose.repository";

const pageExpressController = createPageController(
  createPageService(pageMongooseRepository, roleService)
);

export default createExpressController(pageExpressController);
