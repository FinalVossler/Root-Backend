import { ITranslatedText } from "roottypes";

interface IShippingMethod {
  _id: string;
  name: ITranslatedText[];
  price: number;
}

export default IShippingMethod;
