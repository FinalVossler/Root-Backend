import { fileService } from "../../../ioc";
import createExpressController from "../../../utils/createExpressController";
import createFileController from "../ports/file.controller";

const fileExpressController = createFileController(fileService);

export default createExpressController(fileExpressController);
