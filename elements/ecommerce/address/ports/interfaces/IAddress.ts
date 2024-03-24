import IUser from "../../../../user/ports/interfaces/IUser";

interface IAddress {
  _id: string;
  country: string;
  postalCode: string;
  addressLine1: string;
  addressLine2: string;
  region: string;
  city: string;

  user?: IUser | string;
  isDefault?: boolean;
}

export default IAddress;
