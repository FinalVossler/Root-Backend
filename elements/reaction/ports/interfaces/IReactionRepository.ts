import { IReactionCreateCommand } from "roottypes";
import { IReaction } from "../../reaction.mongoose.model";
import IUser from "../../../user/ports/interfaces/IUser";

interface IReactionRepository {
  create: (
    command: IReactionCreateCommand,
    currentUser: IUser
  ) => Promise<IReaction>;
}

export default IReactionRepository;
