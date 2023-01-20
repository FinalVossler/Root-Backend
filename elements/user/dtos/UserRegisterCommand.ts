import { IUser } from "../user.model";

type UserRegisterCommand = {
  firstName: IUser["firstName"];
  lastName: IUser["lastName"];
  email: IUser["email"];
  password: IUser["password"];
};

export default UserRegisterCommand;
