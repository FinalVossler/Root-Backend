import { ICartUpdateCommand } from "roottypes";

import ICart from "./ICart";

interface ICartRepository {
  getUserCart: (userId: string) => Promise<ICart | null>;
  updateCart: (command: ICartUpdateCommand) => Promise<ICart>;
  createCart: (userId: string) => Promise<ICart>;
}

export default ICartRepository;
