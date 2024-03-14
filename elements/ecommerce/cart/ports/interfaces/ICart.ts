import IUser from "../../../../user/ports/interfaces/IUser";
import IEntity from "../../../../entity/ports/interfaces/IEntity";

interface ICart {
  user: IUser | string;
  products: {
    quantity: number;
    product: IEntity | string;
  }[];
}

export default ICart;
