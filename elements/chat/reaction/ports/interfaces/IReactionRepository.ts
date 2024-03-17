import { IReactionCreateCommand } from "roottypes";

import IUser from "../../../../user/ports/interfaces/IUser";
import IReaction from "./IReaction";

interface IReactionRepository {
  create: (
    command: IReactionCreateCommand,
    currentUser: IUser
  ) => Promise<IReaction>;
  deleteUsersReactions: (usersIds: string[]) => Promise<void>;
}

export default IReactionRepository;
