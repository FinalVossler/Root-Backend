import { ICartUpdateCommand } from "roottypes";

import IUser from "../../../../user/ports/interfaces/IUser";
import ICart from "./ICart";

interface ICartService {
  getUserCart: (currentUser: IUser) => Promise<ICart>;
  updateCart: (
    command: ICartUpdateCommand,
    currentUser: IUser
  ) => Promise<ICart>;
}

export default ICartService;
