import createExpressController from "../../../utils/createExpressController";
import messageMongooseRepository from "../../message/adapters/message.mongoose.repository";
import createMessageService from "../../message/ports/message.service";
import createReactionController from "../ports/reaction.controller";
import createReactionService from "../ports/reaction.service";
import reactionMongooseRepository from "./reaction.mongoose.repository";

const reactionExpressController = createReactionController(
  createReactionService(
    reactionMongooseRepository,
    createMessageService(messageMongooseRepository)
  )
);

export default createExpressController(reactionExpressController);
