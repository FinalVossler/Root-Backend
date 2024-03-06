import { IReactionCreateCommand } from "roottypes";

import IUser from "../../../user/ports/interfaces/IUser";
import IReaction from "./IReaction";

interface IReactionService {
  create: (
    command: IReactionCreateCommand,
    currentUser: IUser
  ) => Promise<IReaction>;
}

export default IReactionService;
