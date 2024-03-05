import createExpressController from "../../../utils/createExpressController";
import createMessageController from "../ports/message.controller";
import createMessageService from "../ports/message.service";
import messageMongooseRepository from "./message.mongoose.repository";

const messageExpressController = createMessageController(
  createMessageService(messageMongooseRepository)
);

export default createExpressController(messageExpressController);
