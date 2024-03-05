import { IReactionCreateCommand } from "roottypes";
import { IReaction } from "../../reaction.mongoose.model";
import IUser from "../../../user/ports/interfaces/IUser";

interface IReactionService {
  create: (
    command: IReactionCreateCommand,
    currentUser: IUser
  ) => Promise<IReaction>;
}

export default IReactionService;
