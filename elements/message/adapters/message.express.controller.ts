import { messageService } from "../../../ioc";
import createExpressController from "../../../utils/createExpressController";
import createMessageController from "../ports/message.controller";

const messageExpressController = createMessageController(messageService);

export default createExpressController(messageExpressController);
