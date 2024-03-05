import { userService } from "../../../ioc";
import createExpressController from "../../../utils/createExpressController";
import createUserController from "../ports/user.controller";

const userExpressController = createUserController(userService);

export default createExpressController(userExpressController);
