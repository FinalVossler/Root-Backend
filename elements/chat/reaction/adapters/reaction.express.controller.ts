import { reactionService } from "../../../../ioc";
import createExpressController from "../../../../utils/createExpressController";
import createReactionController from "../ports/reaction.controller";

const reactionExpressController = createReactionController(reactionService);

export default createExpressController(reactionExpressController);
