import { ITranslatedText } from "roottypes";

interface IPaymentMethod {
  _id: string;
  name: ITranslatedText[];
  slug: string;
}

export default IPaymentMethod;
